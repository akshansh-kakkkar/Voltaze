"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useCurrentUser } from "@/features/auth";
import { useCheckIns } from "@/features/check-ins";
import { useEvents } from "@/features/events";

export default function HostCheckInsPage() {
	const { data: user } = useCurrentUser();
	const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
	const [method, setMethod] = useState<"ALL" | "QR_SCAN" | "MANUAL">("ALL");
	const [search, setSearch] = useState("");

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

	const checkInsQuery = useCheckIns({
		page: 1,
		limit: 100,
		sortBy: "timestamp",
		sortOrder: "desc",
		...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
		...(method !== "ALL" ? { method } : {}),
	});

	const allCheckIns = checkInsQuery.data?.data ?? [];
	const visibleCheckIns = useMemo(() => {
		const hostOnly = allCheckIns.filter((c) => hostEventIds.has(c.eventId));
		const q = search.trim().toLowerCase();
		if (!q) return hostOnly;

		return hostOnly.filter((c) => {
			const eventName = eventNameById.get(c.eventId) ?? c.eventId;
			return (
				c.attendeeId.toLowerCase().includes(q) ||
				c.eventId.toLowerCase().includes(q) ||
				eventName.toLowerCase().includes(q)
			);
		});
	}, [allCheckIns, hostEventIds, search, eventNameById]);

	const stats = useMemo(() => {
		const total = visibleCheckIns.length;
		const qr = visibleCheckIns.filter((c) => c.method === "QR_SCAN").length;
		const manual = visibleCheckIns.filter((c) => c.method === "MANUAL").length;
		const events = new Set(visibleCheckIns.map((c) => c.eventId)).size;
		return { total, qr, manual, events };
	}, [visibleCheckIns]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl text-slate-900">Check-ins</h1>
				<p className="mt-2 text-slate-600">
					Real check-ins scoped to your events.
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="text"
						placeholder="Search by attendee id or event..."
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

				<select
					value={method}
					onChange={(e) => setMethod(e.target.value as typeof method)}
					className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All methods</option>
					<option value="QR_SCAN">QR_SCAN</option>
					<option value="MANUAL">MANUAL</option>
				</select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<StatCard label="Total" value={stats.total} />
				<StatCard label="QR scan" value={stats.qr} />
				<StatCard label="Manual" value={stats.manual} />
				<StatCard label="Events" value={stats.events} />
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-slate-200 border-b bg-slate-50">
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Event
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Attendee ID
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Method
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Timestamp
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{checkInsQuery.isLoading ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={4}>
										Loading check-ins...
									</td>
								</tr>
							) : visibleCheckIns.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={4}>
										No check-ins found.
									</td>
								</tr>
							) : (
								visibleCheckIns.map((checkIn) => (
									<tr key={checkIn.id} className="hover:bg-slate-50">
										<td className="px-4 py-3 text-slate-800">
											{eventNameById.get(checkIn.eventId) ?? checkIn.eventId}
										</td>
										<td className="px-4 py-3 text-slate-600">
											{checkIn.attendeeId}
										</td>
										<td className="px-4 py-3">
											<span className="rounded-full border border-[#dbe7ff] bg-[#f3f8ff] px-2 py-1 font-semibold text-[#0a4bb8] text-xs">
												{checkIn.method}
											</span>
										</td>
										<td className="px-4 py-3 text-slate-600">
											{new Date(checkIn.timestamp).toLocaleString("en-IN")}
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
