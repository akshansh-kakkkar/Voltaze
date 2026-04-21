"use client";

import { useState } from "react";
import { useCheckIns } from "../hooks/use-check-ins";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import type { CheckInRecord } from "../services/check-ins.service";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function CheckInsView() {
	const [page, setPage] = useState(1);
	const [method, setMethod] = useState<string>("");

	const checkInsQuery = useCheckIns({
		page,
		limit: 20,
		method: (method || undefined) as "QR_SCAN" | "MANUAL" | undefined,
		sortBy: "timestamp",
		sortOrder: "desc",
	});

	const columns = [
		{
			header: "Check-in ID",
			cell: (row: CheckInRecord) => (
				<span className="font-mono font-semibold text-sm">
					{row.id.slice(0, 12)}...
				</span>
			),
		},
		{
			header: "Event",
			cell: (row: CheckInRecord) => (
				<Badge variant="outline">{row.eventId.slice(0, 8)}...</Badge>
			),
		},
		{
			header: "Attendee",
			cell: (row: CheckInRecord) => (
				<span className="text-[#5f6984]">{row.attendeeId.slice(0, 10)}...</span>
			),
		},
		{
			header: "Method",
			cell: (row: CheckInRecord) => (
				<Badge variant={row.method === "QR_SCAN" ? "default" : "warning"}>
					{row.method === "QR_SCAN" ? "QR Scan" : "Manual"}
				</Badge>
			),
		},
		{
			header: "Timestamp",
			cell: (row: CheckInRecord) => (
				<span className="text-[#5f6984] text-sm">
					{formatDate(row.timestamp)}
				</span>
			),
		},
	];

	if (checkInsQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Loading check-ins...
			</div>
		);
	}

	if (checkInsQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load check-ins right now.
			</div>
		);
	}

	return (
		<div className="space-y-6 md:space-y-8">
			<SectionTitle
				eyebrow="Check-ins"
				title="Event entry log"
				description="Track every attendee check-in via QR scans and manual entries across all events."
			/>

			<section className="panel-soft p-4 md:p-5">
				<label className="block max-w-xs space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Method
					</span>
					<Select
						value={method}
						onChange={(e) => {
							setMethod(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All methods</option>
						<option value="QR_SCAN">QR Scan</option>
						<option value="MANUAL">Manual</option>
					</Select>
				</label>
			</section>

			<DataTable
				columns={columns}
				data={checkInsQuery.data?.data ?? []}
				meta={checkInsQuery.data?.meta}
				onPageChange={setPage}
				keyExtractor={(row) => row.id}
			/>
		</div>
	);
}
