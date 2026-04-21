"use client";

import { useState } from "react";
import { useOrders } from "../hooks/use-orders";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import type { OrderRecord } from "../services/orders.service";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
	PENDING: "warning",
	COMPLETED: "success",
	CANCELLED: "destructive",
};

export function OrdersView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("");

	const ordersQuery = useOrders({
		page,
		limit: 20,
		status: (status || undefined) as "PENDING" | "COMPLETED" | "CANCELLED" | undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const columns = [
		{
			header: "Order ID",
			cell: (row: OrderRecord) => (
				<span className="font-mono font-semibold text-sm">{row.id.slice(0, 12)}...</span>
			),
		},
		{
			header: "Event",
			cell: (row: OrderRecord) => (
				<Badge variant="outline">{row.eventId.slice(0, 8)}...</Badge>
			),
		},
		{
			header: "Attendee",
			cell: (row: OrderRecord) => (
				<span className="text-[#5f6984]">{row.attendeeId.slice(0, 10)}...</span>
			),
		},
		{
			header: "Status",
			cell: (row: OrderRecord) => (
				<Badge variant={statusVariant[row.status] ?? "default"}>
					{row.status}
				</Badge>
			),
		},
		{
			header: "Created",
			cell: (row: OrderRecord) => (
				<span className="text-[#5f6984] text-sm">{formatDate(row.createdAt)}</span>
			),
		},
	];

	if (ordersQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">Loading orders...</div>
		);
	}

	if (ordersQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load orders right now.
			</div>
		);
	}

	const data = ordersQuery.data;
	const statusCounts = {
		total: data?.meta.total ?? 0,
	};

	return (
		<div className="space-y-6 md:space-y-8">
			<SectionTitle
				eyebrow="Orders"
				title="Track every order across events"
				description="View order status, filter by fulfillment state, and monitor the full order lifecycle."
			/>

			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
					<p className="font-semibold text-[#7a86a8] text-xs uppercase tracking-wide">
						Total orders
					</p>
					<p className="mt-1 font-semibold text-[#1e2a4d] text-lg">
						{statusCounts.total}
					</p>
				</div>
				<div className="rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
					<p className="font-semibold text-[#7a86a8] text-xs uppercase tracking-wide">
						Current page
					</p>
					<p className="mt-1 font-semibold text-[#1e2a4d] text-lg">
						{data?.meta.page ?? 1} / {data?.meta.totalPages ?? 1}
					</p>
				</div>
				<div className="rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
					<p className="font-semibold text-[#7a86a8] text-xs uppercase tracking-wide">
						Status filter
					</p>
					<Select
						value={status}
						onChange={(e) => {
							setStatus(e.target.value);
							setPage(1);
						}}
						className="mt-1 h-9"
					>
						<option value="">All statuses</option>
						<option value="PENDING">Pending</option>
						<option value="COMPLETED">Completed</option>
						<option value="CANCELLED">Cancelled</option>
					</Select>
				</div>
			</div>

			<DataTable
				columns={columns}
				data={data?.data ?? []}
				meta={data?.meta}
				onPageChange={setPage}
				keyExtractor={(row) => row.id}
			/>
		</div>
	);
}
