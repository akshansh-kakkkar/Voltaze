"use client";

import type { Event } from "@voltaze/schema";
import { Check, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCurrentUser } from "@/features/auth";
import { useEvents, useModerateEvent } from "@/features/events";

type ModerationFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function AdminEventsModerationPage() {
	const { data: user, isLoading: userLoading } = useCurrentUser();
	const [moderationFilter, setModerationFilter] =
		useState<ModerationFilter>("PENDING");

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(moderationFilter !== "ALL"
			? { moderationStatus: moderationFilter }
			: {}),
	});

	const stats = useMemo(() => {
		const events = eventsQuery.data?.data ?? [];
		const pending = events.filter(
			(event) => event.moderationStatus === "PENDING",
		).length;
		const approved = events.filter(
			(event) => event.moderationStatus === "APPROVED",
		).length;
		const rejected = events.filter(
			(event) => event.moderationStatus === "REJECTED",
		).length;

		return {
			total: events.length,
			pending,
			approved,
			rejected,
		};
	}, [eventsQuery.data?.data]);

	if (userLoading) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
				Loading admin dashboard...
			</div>
		);
	}

	if (!user) {
		return (
			<div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
				Please sign in to access the admin dashboard.
			</div>
		);
	}

	if (user.role !== "ADMIN") {
		return (
			<div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
				You do not have access to event moderation.
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="font-black text-3xl text-slate-900 tracking-tight">
							Event Moderation
						</h1>
						<p className="mt-1 text-slate-600">
							Approve or reject submitted events before they are visible
							publicly.
						</p>
					</div>
					<button
						type="button"
						onClick={() => eventsQuery.refetch()}
						className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 text-sm hover:bg-slate-50"
					>
						<RefreshCw className="h-4 w-4" />
						Refresh
					</button>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<StatCard label="Total" value={stats.total} />
				<StatCard label="Pending" value={stats.pending} />
				<StatCard label="Approved" value={stats.approved} />
				<StatCard label="Rejected" value={stats.rejected} />
			</div>

			<div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
				{(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((status) => (
					<button
						key={status}
						type="button"
						onClick={() => setModerationFilter(status)}
						className={`rounded-lg px-3 py-1.5 font-semibold text-sm ${
							moderationFilter === status
								? "bg-[#0a4bb8] text-white"
								: "bg-slate-100 text-slate-700 hover:bg-slate-200"
						}`}
					>
						{status}
					</button>
				))}
			</div>

			{eventsQuery.isLoading ? (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
					Loading events...
				</div>
			) : (eventsQuery.data?.data?.length ?? 0) === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
					No events found for the selected moderation filter.
				</div>
			) : (
				<div className="space-y-3">
					{(eventsQuery.data?.data ?? []).map((event) => (
						<ModerationEventCard key={event.id} event={event} />
					))}
				</div>
			)}
		</div>
	);
}

function ModerationEventCard({ event }: { event: Event }) {
	const moderationMutation = useModerateEvent(event.id);

	const onModerate = async (action: "APPROVE" | "REJECT") => {
		await moderationMutation.mutateAsync({ action });
	};

	return (
		<div className="rounded-xl border border-[#dbe7ff] bg-white p-4 shadow-sm">
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<h3 className="font-bold text-lg text-slate-900">{event.name}</h3>
					<p className="text-slate-600 text-sm">{event.venueName}</p>
					<p className="mt-1 text-slate-500 text-sm">
						By user {event.userId ?? "Unknown"}
					</p>
					<div className="mt-2 flex flex-wrap gap-2 text-xs">
						<Pill label={`Status: ${event.status}`} />
						<Pill label={`Moderation: ${event.moderationStatus}`} />
						<Pill label={event.visibility} />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Link
						href={`/events/${event.slug}`}
						className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 text-sm hover:bg-slate-50"
					>
						Preview
					</Link>
					<button
						type="button"
						onClick={() => onModerate("APPROVE")}
						disabled={
							moderationMutation.isPending ||
							event.moderationStatus === "APPROVED"
						}
						className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Check className="h-4 w-4" />
						Approve
					</button>
					<button
						type="button"
						onClick={() => onModerate("REJECT")}
						disabled={
							moderationMutation.isPending ||
							event.moderationStatus === "REJECTED"
						}
						className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-sm text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<X className="h-4 w-4" />
						Reject
					</button>
				</div>
			</div>
			<p className="mt-3 text-slate-500 text-xs">
				Submitted {new Date(event.createdAt).toLocaleString("en-IN")}
			</p>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl border border-[#dbe7ff] bg-white p-3.5">
			<p className="font-semibold text-slate-500 text-xs uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-1 font-black text-2xl text-slate-900">
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}

function Pill({ label }: { label: string }) {
	return (
		<span className="rounded-full border border-[#dbe7ff] bg-[#f5f9ff] px-2.5 py-1 font-semibold text-[#0a4bb8]">
			{label}
		</span>
	);
}
