import { z } from "zod";

export const analyticsFilterSchema = z.object({
	eventId: z.string().cuid().optional(),
	userId: z.string().optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export const eventAnalyticsSchema = z.object({
	eventId: z.string().cuid(),
	totalAttendees: z.number().int(),
	totalTicketsSold: z.number().int(),
	totalRevenue: z.number().int(),
	checkInRate: z.number(),
	ticketTierBreakdown: z.array(
		z.object({
			tierId: z.string().cuid(),
			tierName: z.string(),
			soldCount: z.number().int(),
			revenue: z.number().int(),
		}),
	),
});

export const revenueAnalyticsSchema = z.object({
	totalRevenue: z.number().int(),
	totalOrders: z.number().int(),
	averageOrderValue: z.number(),
	revenueByDate: z.array(
		z.object({
			date: z.string(),
			revenue: z.number().int(),
			orders: z.number().int(),
		}),
	),
});

export const attendeeAnalyticsSchema = z.object({
	totalAttendees: z.number().int(),
	uniqueAttendees: z.number().int(),
	checkInRate: z.number(),
	attendeesByDate: z.array(
		z.object({
			date: z.string(),
			count: z.number().int(),
		}),
	),
});

export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;
export type EventAnalytics = z.infer<typeof eventAnalyticsSchema>;
export type RevenueAnalytics = z.infer<typeof revenueAnalyticsSchema>;
export type AttendeeAnalytics = z.infer<typeof attendeeAnalyticsSchema>;
