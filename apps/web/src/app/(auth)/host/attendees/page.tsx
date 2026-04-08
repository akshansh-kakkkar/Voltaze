"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAttendees } from "@/features/attendees";
import { useCurrentUser } from "@/features/auth";
import { useEvents } from "@/features/events";

export default function HostAttendeesPage() {
	const { data: user } = useCurrentUser();
	const [search, setSearch] = useState("");
	const [selectedEventId, setSelectedEventId] = useState<string>("ALL");

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const hostEvents = useMemo(() => {
		const allEvents = eventsQuery.data?.data ?? [];
		if (!user?.id) return [];
		return allEvents.filter((event) => event.userId === user.id);
	}, [eventsQuery.data?.data, user?.id]);
	const hostEventIds = useMemo(
		() => new Set(hostEvents.map((e) => e.id)),
		[hostEvents],
	);
	const eventNameById = useMemo(
		() => new Map(hostEvents.map((e) => [e.id, e.name])),
		[hostEvents],
	);

	const attendeesQuery = useAttendees({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
		...(search.trim() ? { search: search.trim() } : {}),
	});

	const allAttendees = attendeesQuery.data?.data ?? [];
	const visibleAttendees = useMemo(
		() => allAttendees.filter((a) => hostEventIds.has(a.eventId)),
		[allAttendees, hostEventIds],
	);

	const stats = useMemo(() => {
		const total = visibleAttendees.length;
		const withPhone = visibleAttendees.filter((a) => !!a.phone).length;
		const uniqueEvents = new Set(visibleAttendees.map((a) => a.eventId)).size;
		const recent = visibleAttendees.filter(
			(a) =>
				Date.now() - new Date(a.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
		).length;
		return { total, withPhone, uniqueEvents, recent };
	}, [visibleAttendees]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl text-slate-900">Attendees</h1>
				<p className="mt-2 text-slate-600">
					Real attendees from your events only.
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="text"
						placeholder="Search attendee name or email..."
						className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					/>
				</div>

				<select
					value={selectedEventId}
					onChange={(e) => setSelectedEventId(e.target.value)}
					className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All my events</option>
					{hostEvents.map((event) => (
						<option key={event.id} value={event.id}>
							{event.name}
						</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<StatCard label="Total" value={stats.total} />
				<StatCard label="With phone" value={stats.withPhone} />
				<StatCard label="Events" value={stats.uniqueEvents} />
				<StatCard label="New (7d)" value={stats.recent} />
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-slate-200 border-b bg-slate-50">
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Name
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Email
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Phone
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Event
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Created
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{attendeesQuery.isLoading ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										Loading attendees...
									</td>
								</tr>
							) : visibleAttendees.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										No attendees found.
									</td>
								</tr>
							) : (
								visibleAttendees.map((attendee) => (
									<tr key={attendee.id} className="hover:bg-slate-50">
										<td className="px-4 py-3 font-medium text-slate-900">
											{attendee.name}
										</td>
										<td className="px-4 py-3 text-slate-700">
											{attendee.email}
										</td>
										<td className="px-4 py-3 text-slate-600">
											{attendee.phone || "-"}
										</td>
										<td className="px-4 py-3 text-slate-700">
											{eventNameById.get(attendee.eventId) ?? attendee.eventId}
										</td>
										<td className="px-4 py-3 text-slate-600">
											{new Date(attendee.createdAt).toLocaleString("en-IN")}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border border-[#dbe7ff] bg-white p-4">
			<p className="text-slate-600 text-sm">{label}</p>
			<p className="mt-1 font-bold text-2xl text-slate-900">
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}
