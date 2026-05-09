import { Prisma, prisma, type UserRole } from "@unievent/db";
import {
	type CheckInFilterInput,
	type CreateCheckInInput,
	createPaginationMeta,
} from "@unievent/schema";

import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "@/common/exceptions/app-error";

type CheckInActor = {
	userId: string;
	role: UserRole;
	isHost: boolean;
};

export class CheckInsService {
	private canManageAll(actor: CheckInActor) {
		return actor.role === "ADMIN";
	}

	private buildAccessWhere(actor: CheckInActor): Prisma.CheckInWhereInput {
		if (this.canManageAll(actor)) {
			return {};
		}

		// Show check-ins for events this user owns OR events they attended
		return {
			OR: [
				// Events the actor hosts/owns
				{ attendee: { event: { userId: actor.userId } } },
				// Attendee records linked to this user (for attendees viewing own check-ins)
				{ attendee: { userId: actor.userId } },
			],
		};
	}

	private ensureCanCreateCheckIn(
		attendee: { event: { userId: string | null } },
		actor: CheckInActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		// Allow if the actor owns the event (regardless of isHost flag)
		if (attendee.event.userId && attendee.event.userId === actor.userId) {
			return;
		}

		throw new ForbiddenError(
			"You do not have permission to check in attendees for this event.",
		);
	}

	private ensureCanDeleteCheckIn(
		checkInEventUserId: string | null,
		actor: CheckInActor,
	) {
		if (this.canManageAll(actor)) {
			return;
		}

		if (checkInEventUserId && checkInEventUserId === actor.userId) {
			return;
		}

		throw new ForbiddenError(
			"You do not have permission to delete check-ins for this event.",
		);
	}

	async list(input: CheckInFilterInput, actor: CheckInActor) {
		const { page, limit, sortBy, sortOrder, dateFrom, dateTo, ...filters } =
			input;
		const skip = (page - 1) * limit;

		const where = {
			...filters,
			...this.buildAccessWhere(actor),
			timestamp:
				dateFrom || dateTo
					? {
							gte: dateFrom,
							lte: dateTo,
						}
					: undefined,
		};

		const [data, total] = await Promise.all([
			prisma.checkIn.findMany({
				where,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
				include: {
					attendee: {
						select: { id: true, name: true, email: true },
					},
				},
			}),
			prisma.checkIn.count({ where }),
		]);

		return {
			data,
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(id: string, actor: CheckInActor) {
		const checkIn = await prisma.checkIn.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
		});

		if (!checkIn) throw new NotFoundError("Check-in not found");
		return checkIn;
	}

	async create(input: CreateCheckInInput, actor: CheckInActor) {
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
			throw new BadRequestError("Attendee does not belong to this event");
		}

		this.ensureCanCreateCheckIn(attendee, actor);

		const existingCheckIn = await prisma.checkIn.findFirst({
			where: {
				attendeeId: input.attendeeId,
				eventId: input.eventId,
			},
			select: {
				id: true,
			},
		});

		if (existingCheckIn) {
			throw new ConflictError("Attendee already checked in for this event");
		}

		try {
			const checkIn = await prisma.checkIn.create({ data: input });

			// Mark the pass as USED so re-scanning shows "already checked in"
			await prisma.pass.updateMany({
				where: {
					attendeeId: input.attendeeId,
					eventId: input.eventId,
					status: "ACTIVE",
				},
				data: { status: "USED" },
			});

			return checkIn;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("Attendee already checked in for this event");
				}

				if (error.code === "P2003") {
					throw new BadRequestError("Check-in references invalid relations");
				}
			}

			throw error;
		}
	}

	async delete(id: string, actor: CheckInActor) {
		const checkIn = await prisma.checkIn.findFirst({
			where: {
				id,
				...this.buildAccessWhere(actor),
			},
			select: {
				id: true,
				attendee: {
					select: {
						event: { select: { userId: true } },
					},
				},
			},
		});

		if (!checkIn) {
			throw new NotFoundError("Check-in not found");
		}

		this.ensureCanDeleteCheckIn(checkIn.attendee.event.userId, actor);

		await prisma.checkIn.delete({ where: { id: checkIn.id } });
	}
}

export const checkInsService = new CheckInsService();
