"use client";

import { useState } from "react";
import { usePayments } from "../hooks/use-payments";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import type { PaymentRecord } from "../services/payments.service";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function formatCurrency(amount: number, currency: string) {
	return new Intl.NumberFormat("en", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
	PENDING: "warning",
	SUCCESS: "success",
	FAILED: "destructive",
	REFUNDED: "default",
};

export function PaymentsView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("");

	const paymentsQuery = usePayments({
		page,
		limit: 20,
		status: (status || undefined) as
			| "PENDING"
			| "SUCCESS"
			| "FAILED"
			| "REFUNDED"
			| undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const columns = [
		{
			header: "Payment ID",
			cell: (row: PaymentRecord) => (
				<span className="font-mono font-semibold text-sm">
					{row.id.slice(0, 12)}...
				</span>
			),
		},
		{
			header: "Amount",
			cell: (row: PaymentRecord) => (
				<span className="font-semibold text-[#0e1838]">
					{formatCurrency(row.amount, row.currency)}
				</span>
			),
		},
		{
			header: "Gateway",
			cell: (row: PaymentRecord) => (
				<Badge variant="outline">{row.gateway}</Badge>
			),
		},
		{
			header: "Status",
			cell: (row: PaymentRecord) => (
				<Badge variant={statusVariant[row.status] ?? "default"}>
					{row.status}
				</Badge>
			),
		},
		{
			header: "Transaction ID",
			cell: (row: PaymentRecord) => (
				<span className="text-[#5f6984] text-sm">
					{row.transactionId ?? "—"}
				</span>
			),
		},
		{
			header: "Created",
			cell: (row: PaymentRecord) => (
				<span className="text-[#5f6984] text-sm">
					{formatDate(row.createdAt)}
				</span>
			),
		},
	];

	if (paymentsQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Loading payments...
			</div>
		);
	}

	if (paymentsQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load payments right now.
			</div>
		);
	}

	return (
		<div className="space-y-6 md:space-y-8">
			<SectionTitle
				eyebrow="Payments"
				title="Transaction history"
				description="Monitor payment processing, track transaction status, and view the full financial history."
			/>

			<section className="panel-soft p-4 md:p-5">
				<label className="block max-w-xs space-y-2">
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
						<option value="">All statuses</option>
						<option value="PENDING">Pending</option>
						<option value="SUCCESS">Success</option>
						<option value="FAILED">Failed</option>
						<option value="REFUNDED">Refunded</option>
					</Select>
				</label>
			</section>

			<DataTable
				columns={columns}
				data={paymentsQuery.data?.data ?? []}
				meta={paymentsQuery.data?.meta}
				onPageChange={setPage}
				keyExtractor={(row) => row.id}
			/>
		</div>
	);
}
