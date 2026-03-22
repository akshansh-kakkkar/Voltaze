"use client";

import { buttonVariants } from "@voltaze/ui/components/button";
import { cn } from "@voltaze/ui/lib/utils";
import { format } from "date-fns";
import { Calendar, MapPin, QrCode, Ticket as TicketIcon } from "lucide-react";
import Link from "next/link";
import { useUserTickets } from "@/lib/api/hooks";

export default function MyTicketsPage() {
	const { data: tickets, isLoading } = useUserTickets();

	return (
		<main className="bg-background">
			<div className="bg-muted px-6 py-16 md:px-10 md:py-20">
				<div className="mx-auto flex max-w-[100rem] flex-col justify-between gap-8 md:flex-row md:items-end">
					<div>
						<p className="label-sm mb-4">Passes</p>
						<h1 className="display-lg max-w-[14ch]">My tickets</h1>
					</div>
					<Link
						href="/events"
						className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
					>
						Browse events
					</Link>
				</div>
			</div>

			<div className="mx-auto max-w-[100rem] px-6 py-12 md:px-10 md:py-16">
				{isLoading ? (
					<div className="h-2 w-32 animate-pulse bg-muted" />
				) : !tickets?.length ? (
					<div className="bg-card px-10 py-20 text-center">
						<TicketIcon className="mx-auto mb-6 h-12 w-12 text-muted-foreground" />
						<p className="headline-lg mb-4">No tickets</p>
						<Link href="/events" className={cn(buttonVariants())}>
							Find an event
						</Link>
					</div>
				) : (
					<ul className="space-y-12">
						{tickets.map(
							(ticket: {
								id: string;
								code: string;
								tier?: {
									name?: string;
									event?: {
										title?: string;
										startsAt?: string;
										venueName?: string | null;
										coverUrl?: string | null;
									};
								};
							}) => {
								const event = ticket.tier?.event;
								return (
									<li
										key={ticket.id}
										className="grid gap-0 bg-card md:grid-cols-[1fr_280px]"
									>
										<div className="flex flex-col gap-8 p-8 md:flex-row md:p-10">
											<div
												className="h-40 w-full shrink-0 bg-center bg-cover bg-muted md:h-36 md:w-36"
												style={
													event?.coverUrl
														? { backgroundImage: `url(${event.coverUrl})` }
														: undefined
												}
											/>
											<div className="min-w-0 flex-1">
												<span className="mb-3 inline-block bg-primary px-3 py-1 font-semibold text-[0.65rem] text-primary-foreground uppercase tracking-[0.15em]">
													{ticket.tier?.name ?? "Ticket"}
												</span>
												<h2 className="font-bold font-heading text-2xl tracking-tight">
													{event?.title ?? "Event"}
												</h2>
												<div className="body-md mt-6 space-y-2 text-muted-foreground">
													<p className="flex items-center gap-2">
														<Calendar className="h-4 w-4 shrink-0" />
														{event?.startsAt
															? format(
																	new Date(event.startsAt),
																	"MMM d, yyyy · h:mm a",
																)
															: "TBA"}
													</p>
													<p className="flex items-center gap-2">
														<MapPin className="h-4 w-4 shrink-0" />
														{event?.venueName ?? "TBA"}
													</p>
												</div>
											</div>
										</div>
										<div className="flex flex-col items-center justify-center bg-secondary px-8 py-10">
											<div className="mb-6 flex h-28 w-28 items-center justify-center bg-card">
												<QrCode
													className="h-20 w-20 text-foreground"
													strokeWidth={1.25}
												/>
											</div>
											<p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
												{ticket.code}
											</p>
										</div>
									</li>
								);
							},
						)}
					</ul>
				)}
			</div>
		</main>
	);
}
