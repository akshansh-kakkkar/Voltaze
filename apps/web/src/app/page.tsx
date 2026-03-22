"use client";

import { buttonVariants } from "@voltaze/ui/components/button";
import { Skeleton } from "@voltaze/ui/components/skeleton";
import { cn } from "@voltaze/ui/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useEvents } from "@/lib/api/hooks";

export default function HomePage() {
	const { data: events, isLoading } = useEvents({ status: "PUBLISHED" });

	return (
		<main className="bg-background">
			<section className="bg-primary px-6 py-20 text-primary-foreground md:px-10 md:py-28 lg:py-36">
				<div className="mx-auto flex max-w-[100rem] flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
					<div className="max-w-4xl">
						<p className="label-sm mb-6 text-primary-foreground/90">
							The Kinetic Monolith
						</p>
						<h1 className="display-lg max-w-[18ch] text-primary-foreground">
							Events built for impact.
						</h1>
					</div>
					<div className="flex max-w-md flex-col gap-8 lg:items-end lg:text-right">
						<p className="body-md text-primary-foreground/85">
							Discover conferences, performances, and gatherings — or host your
							own with ticketing that stays out of the way.
						</p>
						<div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
							<Link
								href="/events"
								className={cn(
									buttonVariants({ variant: "outline", size: "lg" }),
								)}
							>
								Browse events
							</Link>
							<Link
								href="/dashboard"
								className={cn(
									buttonVariants({ variant: "default", size: "lg" }),
									"gradient-cta border-0 text-primary-foreground hover:opacity-[0.92]",
								)}
							>
								Host an event
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-muted px-6 py-20 md:px-10 md:py-28">
				<div className="mx-auto max-w-[100rem]">
					<div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
						<div>
							<p className="label-sm mb-3">Upcoming</p>
							<h2 className="headline-lg">Featured</h2>
						</div>
						<Link
							href="/events"
							className={cn(buttonVariants({ variant: "link", size: "sm" }))}
						>
							View all →
						</Link>
					</div>

					{isLoading ? (
						<ul className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<li key={i} className="bg-card p-0">
									<Skeleton className="aspect-[4/3] w-full" />
									<div className="space-y-4 p-8">
										<Skeleton className="h-4 w-1/3" />
										<Skeleton className="h-8 w-4/5" />
										<Skeleton className="h-4 w-1/2" />
									</div>
								</li>
							))}
						</ul>
					) : !events?.length ? (
						<div className="bg-card px-10 py-20 text-center">
							<p className="headline-lg mb-4">Nothing published yet</p>
							<p className="body-md text-muted-foreground">
								Check back soon — or publish your first event from the
								dashboard.
							</p>
						</div>
					) : (
						<ul className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
							{events.slice(0, 6).map((event) => (
								<li key={event.id} className="glow-float bg-card">
									<Link href={`/events/${event.slug}`} className="group block">
										<div
											className="aspect-[4/3] bg-center bg-cover bg-muted transition-opacity group-hover:opacity-90"
											style={
												event.coverUrl
													? { backgroundImage: `url(${event.coverUrl})` }
													: undefined
											}
										/>
										<div className="space-y-4 p-8">
											<p className="label-sm text-muted-foreground">
												{format(new Date(event.startsAt), "MMM d, yyyy")}
											</p>
											<h3 className="font-heading font-semibold text-xl leading-tight tracking-tight group-hover:text-primary">
												{event.title}
											</h3>
											<p className="body-md line-clamp-2 text-muted-foreground">
												{event.venueName ||
													event.city ||
													event.address ||
													"Location TBA"}
											</p>
										</div>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>
		</main>
	);
}
