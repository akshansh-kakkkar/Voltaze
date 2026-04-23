import type { Pass } from "@unievent/db";
import { z } from "zod";

export type { Pass };

export const passSchema = z.object({
	id: z.string().cuid(),
	eventId: z.string().cuid(),
	attendeeId: z.string().cuid(),
	ticketId: z.string().cuid(),
	status: z.enum(["ACTIVE", "USED", "CANCELLED"]),
	code: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
}) satisfies z.ZodType<Pass>;

export const createPassSchema = passSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		code: true,
		status: true,
	})
	.extend({
		eventId: z.string().cuid(),
		attendeeId: z.string().cuid(),
		ticketId: z.string().cuid(),
	});

export const updatePassSchema = createPassSchema.partial().extend({
	status: z.enum(["ACTIVE", "USED", "CANCELLED"]).optional(),
});

export const validatePassSchema = z.object({
	code: z.string(),
	eventId: z.string().cuid(),
});

export const passFilterSchema = z.object({
	eventId: z.string().cuid().optional(),
	attendeeId: z.string().cuid().optional(),
	ticketId: z.string().cuid().optional(),
	status: z.enum(["ACTIVE", "USED", "CANCELLED"]).optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sortBy: z.enum(["createdAt", "status"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePassInput = z.infer<typeof createPassSchema>;
export type UpdatePassInput = z.infer<typeof updatePassSchema>;
export type ValidatePassInput = z.infer<typeof validatePassSchema>;
export type PassFilterInput = z.infer<typeof passFilterSchema>;
