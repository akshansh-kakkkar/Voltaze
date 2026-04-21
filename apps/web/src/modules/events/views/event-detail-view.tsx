"use client";

import Link from "next/link";
import { useEvent } from "../hooks/use-events";
import { ManageTiersPanel } from "../components/manage-tiers-panel";
import { Button } from "@/shared/ui/button";
import { SectionTitle } from "@/shared/ui/section-title";


function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "full",
		timeStyle: "short",
	}).format(new Date(value));
}

export function EventDetailView({ eventId }: { eventId: string }) {
	const eventQuery = useEvent(eventId);
	const event = eventQuery.data;

	if (eventQuery.isLoading) {
		return <div className="panel-soft p-6 text-[#5f6984]">Loading event...</div>;
	}

	if (eventQuery.isError || !event) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load this event right now.
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="space-y-3">
					<span className="chip">Event Detail</span>
					<SectionTitle
						eyebrow={event.type}
						title={event.name}
						description={event.description}
					/>
				</div>
				<Button asChild variant="ghost">
					<Link href="/events">Back to events</Link>
				</Button>
			</div>

			<section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
				<div className="panel space-y-6 p-6 md:p-8">
					<div className="flex flex-wrap items-center gap-3 text-sm">
						<span className="chip">{event.mode}</span>
						<span className="rounded-full bg-[#edf2ff] px-3 py-1 font-semibold text-[#2840a7]">
							{formatDate(event.startDate)}
						</span>
						<span className="rounded-full bg-[#eef9f3] px-3 py-1 font-semibold text-[#0f8152]">
							{event.status}
						</span>
					</div>

					<p className="max-w-3xl leading-relaxed text-[#536081]">
						{event.visibility === "PRIVATE"
							? "This event is private and access is restricted to invited attendees."
							: "This event is public and open to eligible attendees."}
					</p>

					<div className="grid gap-4 sm:grid-cols-3">
						<Metric label="Venue" value={event.venueName} />
						<Metric label="Address" value={event.address} />
						<Metric label="Timezone" value={event.timezone} />
					</div>

					<div className="flex flex-wrap gap-3">
						<Button asChild>
							<Link href={`/events/${event.id}/checkout`}>Reserve pass</Link>
						</Button>
						<Button asChild variant="ghost">
							<Link href={`/events/${event.id}`}>Share detail link</Link>
						</Button>
					</div>
				</div>

				<div className="panel-soft space-y-5 p-6 md:p-8">
					<div>
						<p className="font-semibold text-[#5f6984] text-xs uppercase tracking-[0.18em]">
							Type
						</p>
						<p className="mt-2 text-lg font-semibold text-[#1d2749]">
							{event.type}
						</p>
					</div>

					<div>
						<p className="font-semibold text-[#5f6984] text-xs uppercase tracking-[0.18em]">
							Status
						</p>
						<p className="mt-2 rounded-xl bg-white px-4 py-3 text-[#253052] text-sm shadow-[0_12px_28px_rgba(19,41,102,0.06)]">
							{event.status}
						</p>
					</div>
				</div>
			</section>

			<section className="panel space-y-5 p-6 md:p-8">
				<SectionTitle
					eyebrow="Dates"
					title="When this event runs"
					description="These timestamps come directly from the shared event record so the page stays aligned with backend data."
				/>

				<div className="grid gap-4 lg:grid-cols-2">
					<article className="rounded-2xl border border-[#d9e2f8] bg-[#f8faff] p-4">
						<p className="font-semibold text-[#2440a4] text-sm">Start date</p>
						<h3 className="mt-2 text-lg font-bold text-[#0e1838]">
							{formatDate(event.startDate)}
						</h3>
					</article>
					<article className="rounded-2xl border border-[#d9e2f8] bg-[#f8faff] p-4">
						<p className="font-semibold text-[#2440a4] text-sm">Updated</p>
						<h3 className="mt-2 text-lg font-bold text-[#0e1838]">
							{formatDate(event.updatedAt)}
						</h3>
					</article>
				</div>
			</section>

			<ManageTiersPanel eventId={event.id} eventUserId={event.userId as string} />
		</div>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-[#d9e2f8] bg-white p-4">
			<p className="font-semibold text-[#6e7999] text-xs uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold leading-relaxed text-[#1e2a4d]">
				{value}
			</p>
		</div>
	);
}