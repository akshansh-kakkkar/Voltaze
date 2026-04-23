import { type Prisma, prisma, type User, type UserRole } from "@unievent/db";
import {
	type AdminUpdateUserInput,
	createPaginationMeta,
	type PublicUser,
	publicUserSchema,
	type UpdateProfileInput,
	type UserFilterInput,
} from "@unievent/schema";

import { ForbiddenError, NotFoundError } from "@/common/exceptions/app-error";

type UserActor = {
	userId: string;
	role: UserRole;
	isHost: boolean;
};

/** Public fields returned on user profiles */
const PUBLIC_USER_SELECT = {
	id: true,
	name: true,
	email: true,
	emailVerified: true,
	image: true,
	role: true,
	isHost: true,
	createdAt: true,
	updatedAt: true,
} as const;

export class UsersService {
	private toPublicUser(user: User | Partial<User>): PublicUser {
		return publicUserSchema.parse(user);
	}

	async list(input: UserFilterInput, actor: UserActor) {
		// Only ADMINs can list all users; others can list hosts only
		const { page, limit, sortBy, sortOrder, search, role } = input;
		const skip = (page - 1) * limit;

		// Non-admins may only browse host profiles
		const effectiveRole = actor.role === "ADMIN" ? role : (role ?? "USER");
		if (actor.role !== "ADMIN" && role && role !== "USER") {
			throw new ForbiddenError("You may only browse user profiles");
		}

		const trimmedSearch = search?.trim();

		const where: Prisma.UserWhereInput = {
			role: effectiveRole,
			...(actor.role !== "ADMIN" ? { isHost: true } : {}),
			...(trimmedSearch
				? {
						OR: [
							{ name: { contains: trimmedSearch, mode: "insensitive" } },
							{ email: { contains: trimmedSearch, mode: "insensitive" } },
						],
					}
				: {}),
		};

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				select: PUBLIC_USER_SELECT,
				orderBy: { [sortBy]: sortOrder },
				skip,
				take: limit,
			}),
			prisma.user.count({ where }),
		]);

		return {
			data: users.map((u) => this.toPublicUser(u)),
			meta: createPaginationMeta(page, limit, total),
		};
	}

	async getById(userId: string): Promise<PublicUser> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: PUBLIC_USER_SELECT,
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		return this.toPublicUser(user);
	}

	/**
	 * Fetch a host's public profile with their upcoming / recent events.
	 */
	async getHostProfile(hostId: string) {
		const user = await prisma.user.findUnique({
			where: { id: hostId, isHost: true },
			select: {
				...PUBLIC_USER_SELECT,
				hostedEvents: {
					where: {
						visibility: "PUBLIC",
						status: { in: ["PUBLISHED", "COMPLETED"] },
					},
					orderBy: { startDate: "asc" },
					take: 20,
					select: {
						id: true,
						name: true,
						slug: true,
						coverUrl: true,
						thumbnail: true,
						venueName: true,
						address: true,
						startDate: true,
						endDate: true,
						timezone: true,
						type: true,
						mode: true,
						status: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundError("Host not found");
		}

		const { hostedEvents, ...profile } = user;
		return {
			...this.toPublicUser(profile),
			events: hostedEvents,
		};
	}

	/** Update the current user's own profile (name, image). */
	async updateProfile(
		userId: string,
		input: UpdateProfileInput,
	): Promise<PublicUser> {
		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.image !== undefined ? { image: input.image } : {}),
			},
			select: PUBLIC_USER_SELECT,
		});

		return this.toPublicUser(user);
	}

	/** Set the current user's host mode on or off. */
	async setHostMode(userId: string, enabled: boolean): Promise<PublicUser> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: PUBLIC_USER_SELECT,
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.role === "ADMIN") {
			throw new ForbiddenError("Administrators cannot toggle host mode");
		}

		if (user.isHost === enabled) {
			return this.toPublicUser(user);
		}

		const updated = await prisma.user.update({
			where: { id: userId },
			data: { isHost: enabled },
			select: PUBLIC_USER_SELECT,
		});

		return this.toPublicUser(updated);
	}

	/** Admin-only: update any user's role or full profile. */
	async adminUpdate(
		targetUserId: string,
		actor: UserActor,
		data: AdminUpdateUserInput,
	): Promise<PublicUser> {
		if (actor.role !== "ADMIN") {
			throw new ForbiddenError("Only administrators can update user roles");
		}

		const user = await prisma.user.findUnique({
			where: { id: targetUserId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		const updated = await prisma.user.update({
			where: { id: targetUserId },
			data,
			select: PUBLIC_USER_SELECT,
		});

		return this.toPublicUser(updated);
	}
}

export const usersService = new UsersService();
