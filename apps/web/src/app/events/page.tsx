"use client";

import { Button } from "@voltaze/ui/components/button";
import { Input } from "@voltaze/ui/components/input";
import { Skeleton } from "@voltaze/ui/components/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useEvents } from "@/lib/api/hooks";

export default function EventsPage() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<string | undefined>("PUBLISHED");
	const { data: events, isLoading, error } = useEvents({ search, status });

	return (
		<main className="bg-background">
			<div className="bg-muted px-6 py-16 md:px-10 md:py-24">
				<div className="mx-auto max-w-[100rem]">
					<p className="label-sm mb-4">Catalog</p>
					<h1 className="display-lg mb-6 max-w-[20ch]">All events</h1>
					<p className="body-md max-w-xl text-muted-foreground">
						Search and filter. Public listings only show what organizers have
						published.
					</p>
				</div>
			</div>

			<div className="mx-auto max-w-[100rem] px-6 py-12 md:px-10 md:py-16">
				<div className="mb-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
					<div className="flex max-w-xl flex-1 flex-col gap-2">
						<label htmlFor="search" className="label-sm">
							Search
						</label>
						<Input
							id="search"
							placeholder="Title or description"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<span className="label-sm">Status</span>
						<select
							value={status || ""}
							onChange={(e) => setStatus(e.target.value || undefined)}
							className="h-11 border-0 border-[color-mix(in_srgb,var(--outline-variant)_40%,transparent)] border-b-2 bg-transparent text-sm focus:border-primary focus:outline-none"
						>
							<option value="">Any</option>
							<option value="PUBLISHED">Published</option>
							<option value="DRAFT">Draft</option>
							<option value="COMPLETED">Completed</option>
						</select>
					</div>
				</div>

				{error && (
					<div className="bg-destructive/10 px-8 py-6 text-destructive">
						{error.message}
					</div>
				)}

				{isLoading && (
					<ul className="space-y-12">
						{[1, 2, 3].map((i) => (
							<li key={i} className="flex flex-col gap-6 md:flex-row">
								<Skeleton className="h-48 w-full md:w-72" />
								<div className="flex-1 space-y-4 py-2">
									<Skeleton className="h-6 w-2/3" />
									<Skeleton className="h-4 w-full" />
								</div>
							</li>
						))}
					</ul>
				)}

				{!isLoading && events && events.length > 0 && (
					<ul className="space-y-16">
						{events.map((event) => (
							<li key={event.id}>
								<Link
									href={`/events/${event.slug}`}
									className="group flex flex-col gap-8 md:flex-row md:items-stretch"
								>
									<div
										className="aspect-video w-full bg-center bg-cover bg-muted md:aspect-auto md:h-auto md:min-h-[200px] md:w-80 md:flex-shrink-0"
										style={
											event.coverUrl
												? { backgroundImage: `url(${event.coverUrl})` }
												: undefined
										}
									/>
									<div className="flex flex-1 flex-col justify-center gap-4 py-2">
										<p className="label-sm text-muted-foreground">
											{format(new Date(event.startsAt), "EEEE, MMM d, yyyy")}
										</p>
										<h2 className="font-heading font-semibold text-2xl tracking-tight group-hover:text-primary md:text-3xl">
											{event.title}
										</h2>
										<p className="body-md line-clamp-2 text-muted-foreground">
											{event.description || "No description."}
										</p>
										<div>
											<span className="inline-block bg-secondary px-3 py-1.5 font-semibold text-[0.65rem] text-secondary-foreground uppercase tracking-widest">
												{event.status}
											</span>
										</div>
									</div>
								</Link>
							</li>
						))}
					</ul>
				)}

				{!isLoading && events?.length === 0 && (
					<div className="bg-muted px-10 py-20 text-center">
						<p className="headline-lg mb-4">No matches</p>
						<Button
							variant="ghost"
							onClick={() => {
								setSearch("");
								setStatus(undefined);
							}}
						>
							Reset filters
						</Button>
					</div>
				)}
			</div>
		</main>
	);
}
