"use client";

import { buttonVariants } from "@voltaze/ui/components/button";
import { cn } from "@voltaze/ui/lib/utils";
import { format } from "date-fns";
import { PlusCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { useListOrgEvents, useListOrgs } from "@/lib/api/hooks";
import { authClient } from "@/lib/auth/client";

export default function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();
	const { data: orgs } = useListOrgs();
	const orgId = orgs?.[0]?.id;
	const { data: events, isLoading: eventsLoading } = useListOrgEvents(orgId);

	if (isPending || eventsLoading) {
		return (
			<div className="space-y-10">
				<div className="h-10 w-48 animate-pulse bg-muted" />
				<div className="h-32 w-full max-w-lg animate-pulse bg-muted" />
			</div>
		);
	}

	if (!orgs?.length) {
		return (
			<div className="bg-muted px-8 py-16 text-center md:px-12 md:py-20">
				<p className="label-sm mb-6">Setup</p>
				<h1 className="headline-lg mx-auto mb-6 max-w-md">
					Create an organization to host events.
				</h1>
				<Link
					href="/dashboard/events/new"
					className={cn(
						buttonVariants({ size: "lg" }),
						"gradient-cta inline-flex border-0",
					)}
				>
					Get started
				</Link>
			</div>
		);
	}

	const published = events?.filter((e) => e.status === "PUBLISHED").length ?? 0;

	return (
		<div className="space-y-16">
			<div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
				<div>
					<p className="label-sm mb-4">Dashboard</p>
					<h1 className="display-lg max-w-[20ch]">
						Welcome, {session?.user?.name?.split(" ")[0] || "organizer"}.
					</h1>
					<p className="body-md mt-6 max-w-lg text-muted-foreground">
						{published} published {published === 1 ? "event" : "events"}.
						Revenue and analytics are stubbed for MVP.
					</p>
				</div>
				<Link
					href="/dashboard/events/new"
					className={cn(
						buttonVariants({ variant: "outline", size: "lg" }),
						"inline-flex gap-2",
					)}
				>
					<PlusCircle className="h-5 w-5" />
					New event
				</Link>
			</div>

			<section>
				<div className="mb-10 flex items-end justify-between gap-6">
					<h2 className="headline-lg">Events</h2>
					<Link
						href="/dashboard/events/new"
						className="label-sm hover:text-primary"
					>
						Add →
					</Link>
				</div>

				{!events?.length ? (
					<div className="bg-muted px-8 py-14">
						<Ticket className="mb-4 h-10 w-10 text-muted-foreground" />
						<p className="font-heading font-semibold text-xl">No events yet</p>
						<Link
							href="/dashboard/events/new"
							className={cn(buttonVariants({ className: "mt-6" }))}
						>
							Create one
						</Link>
					</div>
				) : (
					<ul className="space-y-12">
						{events.map((event) => (
							<li
								key={event.id}
								className="flex flex-col gap-6 bg-card p-8 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<p className="label-sm mb-2 text-muted-foreground">
										{event.startsAt
											? format(new Date(event.startsAt), "MMM d, yyyy")
											: "—"}
									</p>
									<h3 className="font-heading font-semibold text-xl md:text-2xl">
										{event.title}
									</h3>
									<span className="mt-3 inline-block bg-secondary px-3 py-1 font-semibold text-[0.65rem] uppercase tracking-widest">
										{event.status}
									</span>
								</div>
								<Link
									href={`/dashboard/events/${event.id}/tickets`}
									className={cn(buttonVariants({ variant: "secondary" }))}
								>
									Tickets
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
