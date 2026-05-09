import { randomBytes } from "node:crypto";
import { Prisma, prisma, type UserRole } from "@unievent/db";
import {
	type CreatePassInput,
	createPaginationMeta,
	type PassFilterInput,
	type UpdatePassInput,
	type ValidatePassInput,
} from "@unievent/schema";

import {
	AppError,
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";

type PassActor = {
	userId: string;
	role: UserRole;
	isHost: boolean;
};

type PassLifecycleStatus = "ACTIVE" | "USED" | "CANCELLED";

function normalizeScanCode(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		return trimmed;
	}

	try {
		const parsed = new URL(trimmed);
		const queryCode =
			parsed.searchParams.get("code") ??
			parsed.searchParams.get("passCode") ??
			parsed.searchParams.get("qr");
		if (queryCode) {
			return queryCode.trim();
		}

		const segments = parsed.pathname.split("/").filter(Boolean);
		const lastSegment = segments[segments.length - 1];
		if (lastSegment) {
			return decodeURIComponent(lastSegment).trim();
		}
	} catch {
		// Not a URL; fall back to the trimmed raw value.
	}

	return trimmed;
}

export class PassesService {
	private canManageAll(actor: PassActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(actor: PassActor): Prisma.PassWhereInput {
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

		return {
			attendee: {
				userId: actor.userId,
			},
		};
	}

	private ensureCanUseEntities(
		entity: { eventUserId: string | null; attendeeUserId: string | null },
		actor: PassActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		if (actor.isHost) {
			if (!entity.eventUserId || entity.eventUserId !== actor.userId) {
				throw new ForbiddenError("You can only manage passes for your events");
			}

			return;
		}

		if (!entity.attendeeUserId || entity.attendeeUserId !== actor.userId) {
			throw new ForbiddenError("You can only manage your own passes");
		}
	}

	private ensureValidStatusTransition(
		currentStatus: PassLifecycleStatus,
		nextStatus: PassLifecycleStatus,
	) {
		if (currentStatus === "USED" && nextStatus !== "USED") {
			throw new BadRequestError("Used passes cannot be reactivated");
		}

		if (currentStatus === "CANCELLED" && nextStatus !== "CANCELLED") {
			throw new BadRequestError("Cancelled passes cannot be reactivated");
		}
	}

	private ensureCanMutateRelations(passStatus: PassLifecycleStatus) {
		if (passStatus !== "ACTIVE") {
			throw new BadRequestError("Only active passes can be reassigned");
		}
	}

	private ensureCanDeletePass(passStatus: PassLifecycleStatus) {
		if (passStatus === "USED") {
			throw new BadRequestError("Used passes cannot be deleted");
		}
	}

	async list(input: PassFilterInput, actor: PassActor) {
		const { page, limit, sortBy, sortOrder, ...filters } = input;
		const skip = (page - 1) * limit;

		const where = {
			...filters,
			...this.buildAccessWhere(actor),
		};

		const [data, total] = await Promise.all([
			prisma.pass.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.pass.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: PassActor) {
		const pass = await prisma.pass.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
		});

		if (!pass) throw new NotFoundError("Pass not found");
		return pass;
	}

	async create(input: CreatePassInput, actor: PassActor) {
		const [event, attendee, ticket] = await Promise.all([
			prisma.event.findUnique({
				where: { id: input.eventId },
				select: {
					id: true,
					userId: true,
				},
			}),
			prisma.attendee.findUnique({
				where: { id: input.attendeeId },
				select: {
					id: true,
					userId: true,
					eventId: true,
				},
			}),
			prisma.ticket.findUnique({
				where: { id: input.ticketId },
				select: {
					id: true,
					eventId: true,
					order: {
						select: {
							attendeeId: true,
						},
					},
				},
			}),
		]);
		if (!event) throw new NotFoundError("Event not found");
		if (!attendee) throw new NotFoundError("Attendee not found");
		if (!ticket) throw new NotFoundError("Ticket not found");
		if (
			attendee.eventId !== input.eventId ||
			ticket.eventId !== input.eventId
		) {
			throw new BadRequestError("Pass references invalid event relation");
		}
		if (ticket.order.attendeeId !== input.attendeeId) {
			throw new BadRequestError("Ticket does not belong to attendee");
		}

		this.ensureCanUseEntities(
			{
				eventUserId: event.userId,
				attendeeUserId: attendee.userId,
			},
			actor,
		);

		try {
			const passCode = `pv_${randomBytes(9).toString("base64url")}`;

			return await prisma.pass.create({
				data: {
					...input,
					code: passCode,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Pass already exists for this ticket");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Pass references invalid relations");
				}
			}

			throw error;
		}
	}

	async update(id: string, input: UpdatePassInput, actor: PassActor) {
		const pass = await prisma.pass.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				eventId: true,
				attendeeId: true,
				ticketId: true,
				status: true,
			},
		});

		if (!pass) {
			throw new NotFoundError("Pass not found");
		}

		if (actor.role === "USER" && Object.keys(input).length > 0) {
			throw new ForbiddenError("Users cannot update pass records");
		}

		const nextStatus = input.status ?? pass.status;
		this.ensureValidStatusTransition(pass.status, nextStatus);

		const nextEventId = input.eventId ?? pass.eventId;
		const nextAttendeeId = input.attendeeId ?? pass.attendeeId;
		const nextTicketId = input.ticketId ?? pass.ticketId;
		const relationChanged =
			nextEventId !== pass.eventId ||
			nextAttendeeId !== pass.attendeeId ||
			nextTicketId !== pass.ticketId;

		if (relationChanged) {
			this.ensureCanMutateRelations(pass.status);

			if (nextStatus !== "ACTIVE") {
				throw new BadRequestError(
					"Pass reassignment is only allowed while pass remains active",
				);
			}

			const [event, attendee, ticket] = await Promise.all([
				prisma.event.findUnique({
					where: { id: nextEventId },
					select: {
						id: true,
						userId: true,
					},
				}),
				prisma.attendee.findUnique({
					where: { id: nextAttendeeId },
					select: {
						id: true,
						userId: true,
						eventId: true,
					},
				}),
				prisma.ticket.findUnique({
					where: { id: nextTicketId },
					select: {
						id: true,
						eventId: true,
						order: {
							select: {
								attendeeId: true,
							},
						},
					},
				}),
			]);

			if (!event) throw new NotFoundError("Event not found");
			if (!attendee) throw new NotFoundError("Attendee not found");
			if (!ticket) throw new NotFoundError("Ticket not found");

			if (attendee.eventId !== nextEventId || ticket.eventId !== nextEventId) {
				throw new BadRequestError("Pass references invalid event relation");
			}

			if (ticket.order.attendeeId !== nextAttendeeId) {
				throw new BadRequestError("Ticket does not belong to attendee");
			}

			this.ensureCanUseEntities(
				{
					eventUserId: event.userId,
					attendeeUserId: attendee.userId,
				},
				actor,
			);
		}

		try {
			return await prisma.pass.update({ where: { id }, data: input });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Pass already exists for this ticket");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Pass references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: PassActor) {
		if (actor.role === "USER") {
			throw new ForbiddenError("Users cannot delete pass records");
		}

		const pass = await prisma.pass.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				status: true,
			},
		});

		if (!pass) {
			throw new NotFoundError("Pass not found");
		}

		this.ensureCanDeletePass(pass.status);

		await prisma.pass.delete({ where: { id: pass.id } });
	}

	async validate(input: ValidatePassInput, actor: PassActor) {
		const normalizedCode = normalizeScanCode(input.code);
		// If the scanned value matches an internal pass id, reject it explicitly.
		// This prevents accidental acceptance when users scan DB ids instead of the
		// intended opaque pass code.
		try {
			const byId = await prisma.pass.findUnique({
				where: { id: normalizedCode },
			});
			if (byId) {
				throw new BadRequestError(
					"Scanned value looks like an internal id. Please scan the pass QR or use the pass code printed on the ticket.",
				);
			}
		} catch (err) {
			// Re-throw application errors (BadRequestError, etc.) so they propagate.
			// Only swallow unexpected DB/infrastructure errors from the id-check lookup.
			if (err instanceof AppError) throw err;
		}
		const pass = await prisma.pass.findFirst({
			where: {
				code: normalizedCode,
				eventId: input.eventId,
			},
			include: {
				attendee: { select: { id: true, name: true, email: true } },
			},
		});
		if (!pass) throw new NotFoundError("Pass not found");
		// For non-admins, verify they own the event before allowing validation.
		if (actor.role !== "ADMIN") {
			const event = await prisma.event.findUnique({
				where: { id: pass.eventId },
				select: { userId: true },
			});
			if (!event || event.userId !== actor.userId) {
				throw new ForbiddenError(
					"You do not have access to validate this pass",
				);
			}
		}
		if (pass.status !== "ACTIVE")
			throw new BadRequestError("Pass is not active");
		return pass;
	}
}

export const passesService = new PassesService();
