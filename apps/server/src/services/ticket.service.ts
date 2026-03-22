import db from "@voltaze/db";
import type {
	CheckInInput,
	CreatePromoCodeInput,
	CreateTicketTierInput,
	PurchaseTicketInput,
} from "@voltaze/schema/ticket";
import { AppError, NotFoundError } from "../lib/errors";
import { createRazorpayOrder } from "../lib/razorpay";
import { generateId } from "../lib/utils";

// ── Ticket Tiers ──

export async function createTier(
	eventId: string,
	input: CreateTicketTierInput,
) {
	const count = await db.ticketTier.count({ where: { eventId } });
	return db.ticketTier.create({
		data: { ...input, eventId, position: count },
	});
}

export async function listTiers(eventId: string) {
	return db.ticketTier.findMany({
		where: { eventId },
		orderBy: { position: "asc" },
	});
}

export async function updateTier(
	tierId: string,
	input: Partial<CreateTicketTierInput>,
) {
	return db.ticketTier.update({ where: { id: tierId }, data: input });
}

export async function deleteTier(tierId: string) {
	return db.ticketTier.delete({ where: { id: tierId } });
}

// ── Promo Codes ──

export async function createPromoCode(
	eventId: string,
	input: CreatePromoCodeInput,
) {
	return db.promoCode.create({ data: { ...input, eventId } });
}

export async function listPromoCodes(eventId: string) {
	return db.promoCode.findMany({
		where: { eventId },
		orderBy: { createdAt: "desc" },
	});
}

export async function validatePromoCode(eventId: string, code: string) {
	const promo = await db.promoCode.findUnique({
		where: { eventId_code: { eventId, code } },
	});

	if (!promo || !promo.isActive) return null;
	if (promo.maxUses && promo.timesUsed >= promo.maxUses) return null;
	if (promo.validFrom && new Date() < promo.validFrom) return null;
	if (promo.validUntil && new Date() > promo.validUntil) return null;

	return promo;
}

// ── Purchase ──

type CartLine = { tierId: string; quantity: number };

function normalizeCart(input: PurchaseTicketInput): CartLine[] {
	if (input.items?.length) return input.items;
	if (input.tierId) return [{ tierId: input.tierId, quantity: input.quantity }];
	throw new AppError("Invalid purchase payload", 400, "INVALID_PURCHASE");
}

/** `tier.price` is stored in whole INR (rupees). Razorpay uses paise. */
function rupeesToPaise(rupees: number): number {
	return Math.round(rupees * 100);
}

export async function purchaseTicket(
	eventId: string,
	userId: string,
	userEmail: string,
	input: PurchaseTicketInput,
) {
	const lines = normalizeCart(input);
	const now = new Date();

	const tiers = await db.ticketTier.findMany({
		where: { id: { in: lines.map((l) => l.tierId) } },
	});
	const tierById = new Map(tiers.map((t) => [t.id, t]));

	for (const line of lines) {
		const tier = tierById.get(line.tierId);
		if (!tier || tier.eventId !== eventId) {
			throw new NotFoundError("Ticket tier");
		}
		if (tier.quantity !== null && tier.sold + line.quantity > tier.quantity) {
			throw new AppError("Not enough tickets available", 400, "SOLD_OUT");
		}
		if (tier.salesStart && now < tier.salesStart) {
			throw new AppError("Sales haven't started", 400, "NOT_ON_SALE");
		}
		if (tier.salesEnd && now > tier.salesEnd) {
			throw new AppError("Sales have ended", 400, "SALES_ENDED");
		}
		if (line.quantity < tier.minPerOrder || line.quantity > tier.maxPerOrder) {
			throw new AppError(
				`Quantity must be between ${tier.minPerOrder} and ${tier.maxPerOrder}`,
				400,
				"INVALID_QUANTITY",
			);
		}
	}

	let subtotalRupee = 0;
	for (const line of lines) {
		const tier = tierById.get(line.tierId);
		if (!tier) throw new NotFoundError("Ticket tier");
		subtotalRupee += tier.price * line.quantity;
	}

	let discountRupee = 0;
	let promoCodeId: string | undefined;
	if (input.promoCode) {
		const promo = await validatePromoCode(eventId, input.promoCode);
		if (promo) {
			promoCodeId = promo.id;
			discountRupee =
				promo.type === "PERCENT"
					? Math.floor((subtotalRupee * promo.value) / 100)
					: Math.min(promo.value, subtotalRupee);
		}
	}

	const totalRupee = Math.max(0, subtotalRupee - discountRupee);
	const totalPaise = rupeesToPaise(totalRupee);

	const rzpClientOrderId = generateId("order");

	// Free order — issue immediately
	if (totalPaise === 0) {
		const tickets = await db.$transaction(async (tx) => {
			const created: Awaited<ReturnType<typeof tx.ticket.create>>[] = [];
			for (const line of lines) {
				const tier = tierById.get(line.tierId);
				if (!tier) throw new NotFoundError("Ticket tier");
				await tx.ticketTier.update({
					where: { id: tier.id },
					data: { sold: { increment: line.quantity } },
				});
				created.push(
					await tx.ticket.create({
						data: {
							code: generateTicketCode(),
							tierId: tier.id,
							userId,
							promoCodeId,
							status: "VALID",
							quantity: line.quantity,
						},
					}),
				);
			}
			if (promoCodeId) {
				await tx.promoCode.update({
					where: { id: promoCodeId },
					data: { timesUsed: { increment: 1 } },
				});
			}
			return created;
		});

		const primaryTicket = tickets.at(0);
		if (!primaryTicket) {
			throw new AppError("No tickets created", 500, "INTERNAL_ERROR");
		}

		return {
			tickets,
			primaryTicket,
			paymentRequired: false,
		};
	}

	// Paid — one Razorpay order for the whole cart; payment row on primary ticket
	const firstLine = lines.at(0);
	if (!firstLine) throw new AppError("Empty cart", 400, "INVALID_INPUT");
	const primaryTier = tierById.get(firstLine.tierId);
	if (!primaryTier) throw new NotFoundError("Ticket tier");

	const { tickets, razorpayOrderId } = await db.$transaction(async (tx) => {
		const created: Awaited<ReturnType<typeof tx.ticket.create>>[] = [];
		for (const line of lines) {
			const tier = tierById.get(line.tierId);
			if (!tier) throw new NotFoundError("Ticket tier");
			created.push(
				await tx.ticket.create({
					data: {
						code: generateTicketCode(),
						tierId: tier.id,
						userId,
						promoCodeId,
						status: "VALID",
						quantity: line.quantity,
					},
				}),
			);
		}
		const primary = created.at(0);
		if (!primary)
			throw new AppError("No tickets created", 500, "INTERNAL_ERROR");
		const rest = created.slice(1);

		const rzpOrder = await createRazorpayOrder({
			orderId: rzpClientOrderId,
			amount: totalPaise,
			customerId: userId,
			customerEmail: userEmail,
			description: `Tickets for event ${eventId}`,
			receipt: primary.id,
		});

		await tx.payment.create({
			data: {
				ticketId: primary.id,
				bundleTicketIds: rest.length ? rest.map((t) => t.id) : undefined,
				razorpayOrderId: rzpOrder.id,
				orderStatus: "CREATED",
				amount: totalPaise,
				currency: primaryTier.currency,
			},
		});

		if (promoCodeId) {
			await tx.promoCode.update({
				where: { id: promoCodeId },
				data: { timesUsed: { increment: 1 } },
			});
		}

		return { tickets: created, razorpayOrderId: rzpOrder.id };
	});

	const primaryTicket = tickets.at(0);
	if (!primaryTicket) {
		throw new AppError("No tickets created", 500, "INTERNAL_ERROR");
	}

	return {
		tickets,
		primaryTicket,
		paymentRequired: true,
		razorpayOrderId,
		amountPaise: totalPaise,
		currency: primaryTier.currency,
	};
}

// ── User Tickets ──

export async function getUserTickets(userId: string) {
	return db.ticket.findMany({
		where: { userId },
		include: {
			tier: {
				include: { event: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

// ── Check-in ──

export async function checkIn(input: CheckInInput, checkedInById?: string) {
	const ticket = await db.ticket.findUnique({
		where: { code: input.ticketCode },
	});
	if (!ticket) throw new NotFoundError("Ticket");
	if (ticket.status !== "VALID") {
		throw new AppError(
			`Ticket is ${ticket.status.toLowerCase()}`,
			400,
			"INVALID_TICKET",
		);
	}

	return db.$transaction(async (tx) => {
		await tx.ticket.update({
			where: { id: ticket.id },
			data: { status: "USED" },
		});

		return tx.checkIn.create({
			data: {
				ticketId: ticket.id,
				method: input.method,
				checkedInById,
			},
		});
	});
}

// ── Helpers ──

function generateTicketCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 8; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}
