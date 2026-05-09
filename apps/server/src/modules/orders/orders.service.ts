import { Prisma, prisma, type UserRole } from "@unievent/db";
import {
	type CreateOrderInput,
	createPaginationMeta,
	type OrderFilterInput,
	type UpdateOrderInput,
} from "@unievent/schema";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";

type OrderActor = {
	userId: string;
	email: string;
	role: UserRole;
	isHost: boolean;
};

// Actor for guest access (when user is not logged in but has email from context)
type GuestOrderActor = {
	userId?: string;
	email?: string;
	role?: UserRole;
	isHost?: boolean;
};

export class OrdersService {
	private canManageAll(actor: OrderActor | GuestOrderActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(
		actor: OrderActor | GuestOrderActor,
	): Prisma.OrderWhereInput {
		if (this.canManageAll(actor)) {
			return {};
		}

		if (actor.isHost) {
			return {
				event: {
					userId: actor.userId,
				},
			};
		}

		// Allow access by userId (authenticated) or email (guest/linked)
		const orConditions: Prisma.AttendeeWhereInput[] = [];
		if (actor.userId) {
			orConditions.push({ userId: actor.userId });
		}
		if (actor.email) {
			orConditions.push({ email: actor.email });
		}

		return {
			attendee: {
				OR: orConditions,
			},
		};
	}

	private ensureCanUseAttendee(
		attendee: { userId: string | null; event: { userId: string | null } },
		actor: OrderActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		// If the user is the one attending, they can always manage their own order
		if (attendee.userId === actor.userId) {
			return;
		}

		// Otherwise, if they have a role that implies management, check ownership
		if (actor.isHost) {
			if (!attendee.event.userId || attendee.event.userId !== actor.userId) {
				throw new ForbiddenError("You can only manage orders for your events");
			}

			return;
		}

		// Default fallback for other users
		if (!attendee.userId || attendee.userId !== actor.userId) {
			throw new ForbiddenError("You can only manage your own orders");
		}
	}

	private ensureCanUseStatusUpdate(input: UpdateOrderInput, actor: OrderActor) {
		if (actor.role === "ADMIN" || actor.isHost) {
			return;
		}

		if (input.status && input.status !== "CANCELLED") {
			throw new ForbiddenError("Users can only cancel their own orders");
		}
	}

	private ensureValidStatusTransition(
		currentStatus: "PENDING" | "COMPLETED" | "CANCELLED",
		nextStatus: "PENDING" | "COMPLETED" | "CANCELLED",
	) {
		if (currentStatus === "CANCELLED" && nextStatus !== "CANCELLED") {
			throw new BadRequestError("Cancelled orders cannot be re-opened");
		}

		if (currentStatus === "COMPLETED" && nextStatus === "PENDING") {
			throw new BadRequestError("Completed orders cannot move back to pending");
		}
	}

	private ensureCanReassignOrder(order: {
		payment: { status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" } | null;
		_count: { tickets: number };
	}) {
		if (order._count.tickets > 0) {
			throw new BadRequestError(
				"Cannot reassign orders that already have issued tickets",
			);
		}

		if (order.payment && order.payment.status === "SUCCESS") {
			throw new BadRequestError(
				"Cannot reassign orders that already have payment records",
			);
		}
	}

	private ensureCanDeleteOrder(order: {
		status: "PENDING" | "COMPLETED" | "CANCELLED";
		payment: {
			status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
		} | null;
		_count: { tickets: number };
	}) {
		if (order.status === "COMPLETED") {
			throw new BadRequestError("Completed orders cannot be deleted");
		}

		if (
			order.payment &&
			(order.payment.status === "SUCCESS" ||
				order.payment.status === "REFUNDED")
		) {
			throw new BadRequestError("Paid orders cannot be deleted");
		}

		if (order._count.tickets > 0) {
			throw new BadRequestError("Orders with issued tickets cannot be deleted");
		}
	}

	async list(input: OrderFilterInput, actor: OrderActor) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;

		const where = {
			...filters,
			...this.buildAccessWhere(actor),
		};

		const [data, total] = await Promise.all([
			prisma.order.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.order.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
		});
		if (!order) throw new NotFoundError("Order not found");
		return order;
	}

	async create(input: CreateOrderInput, actor: OrderActor) {
		const attendee = await prisma.attendee.findUnique({
			where: { id: input.attendeeId },
			include: {
				event: {
					select: {
						userId: true,
					},
				},
			},
		});
		if (!attendee) throw new NotFoundError("Attendee not found");
		if (attendee.eventId !== input.eventId) {
			throw new BadRequestError("Attendee does not belong to event");
		}
		this.ensureCanUseAttendee(attendee, actor);

		const event = await prisma.event.findUnique({
			where: { id: input.eventId },
		});
		if (!event) throw new NotFoundError("Event not found");

		try {
			return await prisma.order.create({
				data: {
					...input,
					totalAmount: input.totalAmount ?? 0,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Order already exists");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Order references invalid relations");
				}
			}

			throw error;
		}
	}

	async update(id: string, input: UpdateOrderInput, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				eventId: true,
				attendeeId: true,
				status: true,
				payment: {
					select: {
						status: true,
					},
				},
				_count: {
					select: {
						tickets: true,
					},
				},
			},
		});

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		this.ensureCanUseStatusUpdate(input, actor);
		const nextStatus = input.status ?? order.status;
		this.ensureValidStatusTransition(order.status, nextStatus);

		if (
			actor.role === "USER" &&
			(input.eventId !== undefined || input.attendeeId !== undefined)
		) {
			throw new BadRequestError("Users cannot reassign orders");
		}

		const nextEventId = input.eventId ?? order.eventId;
		const nextAttendeeId = input.attendeeId ?? order.attendeeId;

		if (nextEventId !== order.eventId || nextAttendeeId !== order.attendeeId) {
			this.ensureCanReassignOrder(order);

			const attendee = await prisma.attendee.findUnique({
				where: { id: nextAttendeeId },
				include: {
					event: {
						select: {
							userId: true,
						},
					},
				},
			});

			if (!attendee) {
				throw new NotFoundError("Attendee not found");
			}

			if (attendee.eventId !== nextEventId) {
				throw new BadRequestError("Attendee does not belong to event");
			}

			this.ensureCanUseAttendee(attendee, actor);
		}

		try {
			return await prisma.order.update({ where: { id }, data: input });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2003") {
					throw new BadRequestError("Order references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				status: true,
				payment: {
					select: {
						id: true,
						status: true,
					},
				},
				_count: {
					select: {
						tickets: true,
					},
				},
			},
		});

		if (!order) {
			throw new NotFoundError("Order not found");
		}

		this.ensureCanDeleteOrder(order);

		await prisma.$transaction(async (tx) => {
			await tx.order.delete({
				where: { id: order.id },
			});

			if (order.payment) {
				await tx.payment.delete({
					where: { id: order.payment.id },
				});
			}
		});
	}

	async generateTicketPdf(id: string, actor: OrderActor) {
		const order = await prisma.order.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			include: {
				attendee: true,
				event: true,
				tickets: {
					include: {
						tier: true,
						pass: true,
					},
				},
			},
		});

		if (!order) throw new NotFoundError("Order not found");

		const bookingDate = new Date(order.createdAt).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});

		const eventStartDate = order.event?.startDate
			? new Date(order.event.startDate).toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
				})
			: "";

		const eventEndDate = order.event?.endDate
			? new Date(order.event.endDate).toLocaleDateString("en-US", {
					day: "numeric",
					year: "numeric",
				})
			: "";

		const eventStartTime = order.event?.startDate
			? new Intl.DateTimeFormat("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				}).format(new Date(order.event.startDate))
			: "";

		const eventEndTime = order.event?.endDate
			? new Intl.DateTimeFormat("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				}).format(new Date(order.event.endDate))
			: "";

		const eventDateStr =
			eventStartDate && eventEndDate
				? `${eventStartDate} to ${eventEndDate}`
				: eventStartDate || "";

		const eventTimeStr =
			eventStartTime && eventEndTime
				? `(${eventStartTime} to ${eventEndTime} IST)`
				: eventStartTime
					? `(${eventStartTime} IST)`
					: "";

		const tickets = await Promise.all(
			order.tickets.map(async (ticket) => {
				const qrCodeData = ticket.pass?.code
					? await QRCode.toDataURL(ticket.pass.code, {
							margin: 0,
							width: 400,
						})
					: null;

				return {
					...ticket,
					qrCodeData,
					tierName: ticket.tier?.name || "Standard",
				};
			}),
		);

		return this.buildPdfBuffer({
			tickets,
			bookingDate,
			shortOrderId: order.id.slice(0, 8),
			attendeeName: order.attendee.name,
			eventName: order.event.name,
			eventDateStr,
			eventTimeStr,
		});
	}

	private async buildPdfBuffer(data: {
		tickets: Array<{
			qrCodeData: string | null;
			tierName: string;
		}>;
		bookingDate: string;
		shortOrderId: string;
		attendeeName: string;
		eventName: string;
		eventDateStr: string;
		eventTimeStr: string;
	}): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const doc = new PDFDocument({
				size: [657, 557],
				margins: { top: 40, left: 40, right: 40, bottom: 40 },
			});
			const chunks: Buffer[] = [];

			doc.on("data", (chunk: Buffer) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			for (const ticket of data.tickets) {
				// Top row: Booking info left, QR right
				doc.font("Helvetica").fontSize(12).fillColor("#64748b");
				doc.text(`Booking Date: ${data.bookingDate}`, 40, 40, { width: 420 });

				doc.text("Booking ID:", 40, 55);
				doc
					.fillColor("#000")
					.font("Courier-Bold")
					.text(data.shortOrderId, 105, 55);
				doc.font("Helvetica");

				// QR code
				if (ticket.qrCodeData) {
					const qrBuffer = Buffer.from(
						ticket.qrCodeData.replace(/^data:\w+\/[\w+]+;base64,/, ""),
						"base64",
					);
					doc.image(qrBuffer, 497, 35, { width: 120, height: 120 });
				}

				// Attendee section
				doc.fontSize(10).fillColor("#1e40af").text("ATTENDEE DETAILS", 40, 175);
				doc.fontSize(14).fillColor("#000").text(data.attendeeName, 40, 190);

				// Details - stacked vertically with labels above values
				const startY = 230;
				const rowH = 45;

				doc.fontSize(9).fillColor("#64748b").text("EVENT NAME", 40, startY);
				doc
					.fontSize(11)
					.fillColor("#000")
					.text(data.eventName, 40, startY + 12, { width: 577 });

				doc
					.fontSize(9)
					.fillColor("#64748b")
					.text("EVENT DATE", 40, startY + rowH);
				doc
					.fontSize(11)
					.fillColor("#000")
					.text(
						`${data.eventDateStr} ${data.eventTimeStr}`,
						40,
						startY + rowH + 12,
					);

				doc
					.fontSize(9)
					.fillColor("#64748b")
					.text("TICKET NAME", 40, startY + rowH * 2);
				doc
					.fontSize(11)
					.fillColor("#000")
					.text(ticket.tierName, 40, startY + rowH * 2 + 12);

				// Footer
				const footerY = 490;
				doc.moveTo(40, footerY).lineTo(270, footerY).stroke("#e2e8f0");
				doc
					.fontSize(10)
					.fillColor("#1e3a8a")
					.text("POWERED BY", 270, footerY - 5, {
						align: "center",
						width: 117,
					});
				doc.moveTo(387, footerY).lineTo(617, footerY).stroke("#e2e8f0");
				doc
					.fontSize(14)
					.fillColor("#000031")
					.font("Helvetica-Bold")
					.text("UniEvent", 0, footerY + 5, { align: "center", width: 657 });
				doc.font("Helvetica");

				if (data.tickets.indexOf(ticket) < data.tickets.length - 1) {
					doc.addPage();
				}
			}

			doc.end();
		});
	}
}

export const ordersService = new OrdersService();
