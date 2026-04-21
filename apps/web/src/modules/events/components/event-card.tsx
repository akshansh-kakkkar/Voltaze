import Link from "next/link";
import type { EventRecord } from "@unievent/schema";
import { Button } from "@/shared/ui/button";

const modeColor: Record<EventRecord["mode"], string> = {
	ONLINE: "bg-[#e8f1ff] text-[#2149b8]",
	OFFLINE: "bg-[#e8fff2] text-[#0d8a58]",
};


function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function EventCard({ event }: { event: EventRecord }) {
	return (
		<article className="panel flex flex-col gap-4 p-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<span className="chip">{event.type}</span>
				<span
					className={`rounded-full px-3 py-1 font-semibold text-xs ${modeColor[event.mode]}`}
				>
					{event.mode}
				</span>
			</div>

			<div>
				<h3 className="display-font font-bold text-2xl text-[#0e1838]">
					{event.name}
				</h3>
				<p className="mt-1 text-[#566283]">{formatDate(event.startDate)}</p>
			</div>

			<div className="grid gap-3 rounded-xl bg-[#f5f8ff] p-4 text-sm sm:grid-cols-2">
				<div>
					<p className="font-medium text-[#5f6984]">Location</p>
					<p className="font-semibold text-[#1d2749]">{event.venueName}</p>
				</div>
				<div>
					<p className="font-medium text-[#5f6984]">Visibility</p>
					<p className="font-semibold text-[#1d2749]">{event.visibility}</p>
				</div>
			</div>

			<p className="line-clamp-2 font-medium text-[#30416f] text-sm">
				{event.description}
			</p>

			<div className="flex flex-wrap gap-3 pt-1">
				<Button asChild size="sm">
					<Link href={`/events/${event.id}`}>View details</Link>
				</Button>
				<Button asChild variant="ghost" size="sm">
					<Link href="/tickets">Open ticket hub</Link>
				</Button>
			</div>
		</article>
	);
}
