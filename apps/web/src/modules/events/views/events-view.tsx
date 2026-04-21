"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/core/providers/auth-provider";
import { useEvents } from "../hooks/use-events";
import { Button } from "@/shared/ui/button";
import { SectionTitle } from "@/shared/ui/section-title";
import { EventCard } from "../components/event-card";

const modeFilters = ["ALL", "ONLINE", "OFFLINE"] as const;
const typeFilters = ["ALL", "FREE", "PAID"] as const;

type ModeFilter = (typeof modeFilters)[number];
type TypeFilter = (typeof typeFilters)[number];
type SortOption = "SOONEST" | "LATEST" | "ALPHA";

export function EventsView() {
	const { user } = useAuth();
	const eventsQuery = useEvents({ limit: 100 });

	const [query, setQuery] = useState("");
	const [modeFilter, setModeFilter] = useState<ModeFilter>("ALL");
	const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
	const [sortBy, setSortBy] = useState<SortOption>("SOONEST");

	const events = eventsQuery.data?.data ?? [];

	const filteredEvents = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		const baseResults = events.filter((event) => {
			const matchesQuery =
				normalizedQuery.length === 0 ||
				[event.name, event.venueName, event.description]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);
			const matchesMode = modeFilter === "ALL" || event.mode === modeFilter;
			const matchesType = typeFilter === "ALL" || event.type === typeFilter;

			return matchesQuery && matchesMode && matchesType;
		});

		return [...baseResults].sort((a, b) => {
			if (sortBy === "LATEST") {
				return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
			}

			if (sortBy === "ALPHA") {
				return a.name.localeCompare(b.name);
			}

			return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
		});
	}, [events, query, modeFilter, typeFilter, sortBy]);

	function clearFilters() {
		setQuery("");
		setModeFilter("ALL");
		setTypeFilter("ALL");
		setSortBy("SOONEST");
	}

	if (eventsQuery.isLoading) {
		return <div className="panel-soft p-6 text-[#5f6984]">Loading events...</div>;
	}

	if (eventsQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load events right now.
			</div>
		);
	}

	return (
		<div className="space-y-6 md:space-y-8">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div className="flex-1">
					<SectionTitle
						eyebrow="Events"
						title="Discover, filter, and plan your next event"
						description="Search by keyword, narrow by mode or type, and sort by date or title."
					/>
				</div>
				{(user?.role === "HOST" || user?.role === "ADMIN") && (
					<Button asChild size="lg" className="shrink-0">
						<Link href="/events/create">+ Create New Event</Link>
					</Button>
				)}
			</div>

			<section className="panel-soft grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_160px_170px_170px_auto] md:items-end md:p-5">
				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Search
					</span>
					<input
						type="search"
						placeholder="Try venue, name, description..."
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-3 text-sm text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
					/>
				</label>

				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Mode
					</span>
					<select
						value={modeFilter}
						onChange={(event) => setModeFilter(event.target.value as ModeFilter)}
						className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-3 text-sm text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
					>
						{modeFilters.map((mode) => (
							<option key={mode} value={mode}>
								{mode === "ALL" ? "All modes" : mode}
							</option>
						))}
					</select>
				</label>

				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Type
					</span>
					<select
						value={typeFilter}
						onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
						className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-3 text-sm text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
					>
						{typeFilters.map((type) => (
							<option key={type} value={type}>
								{type === "ALL" ? "All types" : type}
							</option>
						))}
					</select>
				</label>

				<label className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Sort
					</span>
					<select
						value={sortBy}
						onChange={(event) => setSortBy(event.target.value as SortOption)}
						className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-3 text-sm text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
					>
						<option value="SOONEST">Soonest first</option>
						<option value="LATEST">Latest first</option>
						<option value="ALPHA">A to Z</option>
					</select>
				</label>

				<Button
					type="button"
					variant="ghost"
					onClick={clearFilters}
					className="md:self-end"
				>
					Reset
				</Button>
			</section>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="font-semibold text-[#24315a] text-sm">
					{filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
				</p>
				<p className="text-[#5f6984] text-sm">
					Showing {modeFilter === "ALL" ? "all modes" : modeFilter.toLowerCase()} events
				</p>
			</div>

			{filteredEvents.length === 0 ? (
				<section className="panel-soft p-8 text-center">
					<p className="display-font font-bold text-2xl text-[#12204a]">
						No events match those filters
					</p>
					<p className="mx-auto mt-3 max-w-xl text-[#5f6984]">
						Try a broader search or reset filters to see the full event lineup.
					</p>
				</section>
			) : (
				<div className="grid gap-4 lg:grid-cols-2">
					{filteredEvents.map((event) => (
						<EventCard key={event.id} event={event} />
					))}
				</div>
			)}
		</div>
	);
}
