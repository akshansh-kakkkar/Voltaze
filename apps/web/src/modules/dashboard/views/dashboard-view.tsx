"use client";

import { useMemo } from "react";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";
import { useEvents } from "@/modules/events";
import { useTickets } from "@/modules/tickets";
import { SectionTitle } from "@/shared/ui/section-title";
import { MetricCard } from "../components/metric-card";
import { RevenueChart, AttendanceChart } from "../components/analytics-charts";

export function DashboardView() {
	const eventsQuery = useEvents({ limit: 100 });
	const ticketsQuery = useTickets({ limit: 100 });
	const analyticsQuery = useDashboardAnalytics({ groupBy: "day" });

	const events = eventsQuery.data?.data ?? [];
	const tickets = ticketsQuery.data?.data ?? [];
	
	const revenueData = analyticsQuery.revenueQuery.data?.revenueByDate ?? [];
	// Mock daily attendance parsing since backend doesn't explicitly return basic grouped attendance yet
	// In reality we rely on attendeesQuery metrics
	const attendeesCount = analyticsQuery.attendeesQuery.data?.totalAttendees ?? 0;
	// create simple mock array for demo chart based on revenue points
	const attendanceData = revenueData.map((d) => ({
		date: d.date,
		attendees: Math.floor(d.orders * (attendeesCount / (analyticsQuery.revenueQuery.data?.totalOrders || 1))),
	}));

	const metrics = useMemo(() => {
		const revenue = analyticsQuery.revenueQuery.data?.totalRevenue ?? 0;
		const attendees = analyticsQuery.attendeesQuery.data?.totalAttendees ?? 0;
		const averageOrderValue = analyticsQuery.revenueQuery.data?.averageOrderValue ?? 0;
		const checkInRate = analyticsQuery.attendeesQuery.data?.checkInRate ?? 0;

		return [
			{ label: "Live events", value: String(events.length), delta: "From the shared event API" },
			{ label: "Tickets issued", value: String(tickets.length), delta: "Across all loaded tickets" },
			{ label: "Revenue", value: new Intl.NumberFormat("en", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(revenue), delta: `Avg. order ${new Intl.NumberFormat("en", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(averageOrderValue)}` },
			{ label: "Check-in rate", value: `${Math.round(checkInRate * 100)}%`, delta: `${attendees} attendees tracked` },
		];
	}, [analyticsQuery.attendeesQuery.data, analyticsQuery.revenueQuery.data, events.length, tickets.length]);

	if (eventsQuery.isLoading || ticketsQuery.isLoading || analyticsQuery.isLoading) {
		return <div className="panel-soft p-6 text-[#5f6984]">Loading dashboard...</div>;
	}

	if (eventsQuery.isError || ticketsQuery.isError) {
		return <div className="panel-soft p-6 text-[#5f6984]">Unable to load dashboard data right now.</div>;
	}

	return (
		<div className="space-y-8">
			<SectionTitle
				eyebrow="Dashboard"
				title="Operational pulse for events and ticketing"
				description="Track event volume, issued tickets, revenue, and check-in health from live API data."
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{metrics.map((metric) => (
					<MetricCard
						key={metric.label}
						label={metric.label}
						value={metric.value}
						delta={metric.delta}
					/>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="panel-soft p-6">
					<h3 className="mb-6 display-font font-bold text-xl text-[#112152]">
						Revenue over time
					</h3>
					<RevenueChart data={revenueData} />
				</section>
				
				<section className="panel-soft p-6">
					<h3 className="mb-6 display-font font-bold text-xl text-[#112152]">
						Attendance pacing
					</h3>
					<AttendanceChart data={attendanceData} />
				</section>
			</div>
		</div>
	);
}
