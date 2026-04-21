"use client";

import { useState } from "react";
import { useAttendees } from "../hooks/use-attendees";
import { SectionTitle } from "@/shared/ui/section-title";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import type { AttendeeRecord } from "../services/attendees.service";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function AttendeesView() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<"createdAt" | "name" | "email">("createdAt");

	const attendeesQuery = useAttendees({
		page,
		limit: 20,
		search: search.trim() || undefined,
		sortBy,
		sortOrder: "desc",
	});

	const columns = [
		{
			header: "Name",
			cell: (row: AttendeeRecord) => (
				<span className="font-semibold">{row.name}</span>
			),
		},
		{
			header: "Email",
			accessorKey: "email" as keyof AttendeeRecord,
		},
		{
			header: "Phone",
			cell: (row: AttendeeRecord) => (
				<span className="text-[#5f6984]">{row.phone ?? "—"}</span>
			),
		},
		{
			header: "Event",
			cell: (row: AttendeeRecord) => (
				<Badge variant="outline">{row.eventId.slice(0, 8)}...</Badge>
			),
		},
		{
			header: "Registered",
			cell: (row: AttendeeRecord) => (
				<span className="text-[#5f6984] text-sm">{formatDate(row.createdAt)}</span>
			),
		},
	];

	if (attendeesQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Loading attendees...
			</div>
		);
	}

	if (attendeesQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load attendees right now.
			</div>
		);
	}

	return (
		<div className="space-y-6 md:space-y-8">
			<SectionTitle
				eyebrow="Attendees"
				title="Registered attendees across all events"
				description="Search, filter, and manage people who have registered for events on the platform."
			/>

			<section className="panel-soft grid gap-4 p-4 md:grid-cols-[1fr_180px] md:items-end md:p-5">
				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Search
					</span>
					<Input
						type="search"
						placeholder="Name, email..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</label>

				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Sort by
					</span>
					<Select
						value={sortBy}
						onChange={(e) =>
							setSortBy(e.target.value as "createdAt" | "name" | "email")
						}
					>
						<option value="createdAt">Date registered</option>
						<option value="name">Name</option>
						<option value="email">Email</option>
					</Select>
				</label>
			</section>

			<DataTable
				columns={columns}
				data={attendeesQuery.data?.data ?? []}
				meta={attendeesQuery.data?.meta}
				onPageChange={setPage}
				keyExtractor={(row) => row.id}
			/>
		</div>
	);
}
