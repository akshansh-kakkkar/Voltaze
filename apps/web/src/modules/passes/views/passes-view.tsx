"use client";

import { useState } from "react";
import { usePasses } from "../hooks/use-passes";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import type { PassRecord } from "../services/passes.service";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
	ACTIVE: "success",
	USED: "default",
	CANCELLED: "destructive",
};

const typeVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
	GENERAL: "default",
	VIP: "warning",
	BACKSTAGE: "destructive",
	SPEAKER: "success",
};

import { QRCodeSVG } from "qrcode.react";

export function PassesView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("");
	const [type, setType] = useState<string>("");

	const passesQuery = usePasses({
		page,
		limit: 20,
		status: (status || undefined) as "ACTIVE" | "USED" | "CANCELLED" | undefined,
		type: (type || undefined) as "GENERAL" | "VIP" | "BACKSTAGE" | "SPEAKER" | undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const columns = [
		{
			header: "Entry QR Code",
			cell: (row: PassRecord) => (
				<div className="flex items-center gap-4">
					<div className="rounded-md border p-1 bg-white">
						<QRCodeSVG value={row.code} size={48} level="M" />
					</div>
					<span className="font-mono font-semibold text-sm">{row.code}</span>
				</div>
			),
		},
		{
			header: "Type",
			cell: (row: PassRecord) => (
				<Badge variant={typeVariant[row.type] ?? "default"}>
					{row.type}
				</Badge>
			),
		},
		{
			header: "Status",
			cell: (row: PassRecord) => (
				<Badge variant={statusVariant[row.status] ?? "default"}>
					{row.status}
				</Badge>
			),
		},
		{
			header: "Event",
			cell: (row: PassRecord) => (
				<Badge variant="outline">{row.eventId.slice(0, 8)}...</Badge>
			),
		},
		{
			header: "Attendee",
			cell: (row: PassRecord) => (
				<span className="text-[#5f6984]">{row.attendeeId.slice(0, 10)}...</span>
			),
		},
		{
			header: "Issued",
			cell: (row: PassRecord) => (
				<span className="text-[#5f6984] text-sm">{formatDate(row.createdAt)}</span>
			),
		},
	];

	if (passesQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">Loading passes...</div>
		);
	}

	if (passesQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load passes right now.
			</div>
		);
	}

	return (
		<div className="space-y-6 md:space-y-8">
			<SectionTitle
				eyebrow="Passes"
				title="Entry passes for all events"
				description="View, filter, and manage entry passes. Each pass has a unique code for QR-based check-in."
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
						<option value="">All statuses</option>
						<option value="ACTIVE">Active</option>
						<option value="USED">Used</option>
						<option value="CANCELLED">Cancelled</option>
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
						<option value="GENERAL">General</option>
						<option value="VIP">VIP</option>
						<option value="BACKSTAGE">Backstage</option>
						<option value="SPEAKER">Speaker</option>
					</Select>
				</label>
			</section>

			<DataTable
				columns={columns}
				data={passesQuery.data?.data ?? []}
				meta={passesQuery.data?.meta}
				onPageChange={setPage}
				keyExtractor={(row) => row.id}
			/>
		</div>
	);
}
