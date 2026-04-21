"use client";

import { useState } from "react";
import { useNotifications } from "../hooks/use-notifications";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import type { NotificationRecord } from "../services/notifications.service";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const typeLabels: Record<string, string> = {
	EVENT_CREATED: "Event Created",
	EVENT_UPDATED: "Event Updated",
	EVENT_CANCELLED: "Event Cancelled",
	EVENT_REMINDER: "Reminder",
	ORDER_CONFIRMED: "Order Confirmed",
	PAYMENT_SUCCESS: "Payment Success",
	PAYMENT_FAILED: "Payment Failed",
	CHECK_IN_CONFIRMED: "Check-in",
	PASS_ISSUED: "Pass Issued",
};

const statusVariant: Record<string, "default" | "success" | "warning"> = {
	UNREAD: "warning",
	READ: "default",
	ARCHIVED: "success",
};

export function NotificationsView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("");
	const [type, setType] = useState<string>("");

	const notificationsQuery = useNotifications({
		page,
		limit: 20,
		status: (status || undefined) as "UNREAD" | "READ" | "ARCHIVED" | undefined,
		type: (type || undefined) as "EVENT_CREATED" | "EVENT_UPDATED" | "EVENT_CANCELLED" | "EVENT_REMINDER" | "ORDER_CONFIRMED" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "CHECK_IN_CONFIRMED" | "PASS_ISSUED" | undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const columns = [
		{
			header: "Title",
			cell: (row: NotificationRecord) => (
				<div>
					<p className="font-semibold text-[#1e2a4d]">{row.title}</p>
					<p className="mt-0.5 line-clamp-1 text-[#5f6984] text-xs">
						{row.message}
					</p>
				</div>
			),
		},
		{
			header: "Type",
			cell: (row: NotificationRecord) => (
				<Badge variant="outline">
					{typeLabels[row.type] ?? row.type}
				</Badge>
			),
		},
		{
			header: "Status",
			cell: (row: NotificationRecord) => (
				<Badge variant={statusVariant[row.status] ?? "default"}>
					{row.status}
				</Badge>
			),
		},
		{
			header: "Date",
			cell: (row: NotificationRecord) => (
				<span className="text-[#5f6984] text-sm">
					{formatDate(row.createdAt)}
				</span>
			),
		},
	];

	if (notificationsQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Loading notifications...
			</div>
		);
	}

	if (notificationsQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load notifications right now.
			</div>
		);
	}

	return (
		<div className="space-y-6 md:space-y-8">
			<SectionTitle
				eyebrow="Notifications"
				title="Stay informed about everything"
				description="Browse event updates, payment confirmations, check-in alerts, and system notifications."
			/>

			<section className="panel-soft grid gap-4 p-4 md:grid-cols-2 md:items-end md:p-5">
				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Status
					</span>
					<Select
						value={status}
						onChange={(e) => {
							setStatus(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All</option>
						<option value="UNREAD">Unread</option>
						<option value="READ">Read</option>
						<option value="ARCHIVED">Archived</option>
					</Select>
				</label>

				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Type
					</span>
					<Select
						value={type}
						onChange={(e) => {
							setType(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All types</option>
						<option value="EVENT_CREATED">Event Created</option>
						<option value="EVENT_UPDATED">Event Updated</option>
						<option value="EVENT_CANCELLED">Event Cancelled</option>
						<option value="EVENT_REMINDER">Reminder</option>
						<option value="ORDER_CONFIRMED">Order Confirmed</option>
						<option value="PAYMENT_SUCCESS">Payment Success</option>
						<option value="PAYMENT_FAILED">Payment Failed</option>
						<option value="CHECK_IN_CONFIRMED">Check-in</option>
						<option value="PASS_ISSUED">Pass Issued</option>
					</Select>
				</label>
			</section>

			<DataTable
				columns={columns}
				data={notificationsQuery.data?.data ?? []}
				meta={notificationsQuery.data?.meta}
				onPageChange={setPage}
				keyExtractor={(row) => row.id}
			/>
		</div>
	);
}
