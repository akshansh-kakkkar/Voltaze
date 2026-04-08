"use client";

import { useMemo, useState } from "react";
import { useCurrentUser } from "@/features/auth";
import { useEvents } from "@/features/events";
import { usePasses } from "@/features/passes";

export default function HostPassesPage() {
	const { data: user } = useCurrentUser();
	const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
	const [status, setStatus] = useState<"ALL" | "ACTIVE" | "USED" | "CANCELLED">(
		"ALL",
	);

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

	const passesQuery = usePasses({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
		...(status !== "ALL" ? { status } : {}),
	});

	const allPasses = passesQuery.data?.data ?? [];
	const visiblePasses = useMemo(
		() => allPasses.filter((p) => hostEventIds.has(p.eventId)),
		[allPasses, hostEventIds],
	);

	const stats = useMemo(() => {
		const total = visiblePasses.length;
		const active = visiblePasses.filter((p) => p.status === "ACTIVE").length;
		const used = visiblePasses.filter((p) => p.status === "USED").length;
		const cancelled = visiblePasses.filter(
			(p) => p.status === "CANCELLED",
		).length;
		return { total, active, used, cancelled };
	}, [visiblePasses]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl text-slate-900">Passes</h1>
				<p className="mt-2 text-slate-600">
					All passes scoped to your created events.
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
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
					value={status}
					onChange={(e) => setStatus(e.target.value as typeof status)}
					className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All status</option>
					<option value="ACTIVE">ACTIVE</option>
					<option value="USED">USED</option>
					<option value="CANCELLED">CANCELLED</option>
				</select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<StatCard label="Total" value={stats.total} />
				<StatCard label="Active" value={stats.active} />
				<StatCard label="Used" value={stats.used} />
				<StatCard label="Cancelled" value={stats.cancelled} />
			</div>

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-slate-200 border-b bg-slate-50">
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Code
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Event
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Type
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Status
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Created
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{passesQuery.isLoading ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										Loading passes...
									</td>
								</tr>
							) : visiblePasses.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										No passes found.
									</td>
								</tr>
							) : (
								visiblePasses.map((pass) => (
									<tr key={pass.id} className="hover:bg-slate-50">
										<td className="px-4 py-3 font-medium text-[#0a4bb8]">
											{pass.code}
										</td>
										<td className="px-4 py-3 text-slate-800">
											{eventNameById.get(pass.eventId) ?? pass.eventId}
										</td>
										<td className="px-4 py-3 text-slate-600">{pass.type}</td>
										<td className="px-4 py-3">
											<PassStatusBadge status={pass.status} />
										</td>
										<td className="px-4 py-3 text-slate-600">
											{new Date(pass.createdAt).toLocaleString("en-IN")}
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

function PassStatusBadge({
	status,
}: {
	status: "ACTIVE" | "USED" | "CANCELLED";
}) {
	const cls =
		status === "ACTIVE"
			? "bg-emerald-100 text-emerald-700 border-emerald-200"
			: status === "USED"
				? "bg-blue-100 text-blue-700 border-blue-200"
				: "bg-rose-100 text-rose-700 border-rose-200";

	return (
		<span
			className={`rounded-full border px-2 py-1 font-semibold text-xs ${cls}`}
		>
			{status}
		</span>
	);
}
