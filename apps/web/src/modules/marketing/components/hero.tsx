import Image from "next/image";
import Link from "next/link";
import { modulePillars } from "@/core/config/navigation";
import { Button } from "@/shared/ui/button";

export function Hero() {
	return (
		<section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
			<div className="panel relative overflow-hidden px-6 py-8 md:px-10 md:py-12">
				<div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#1f4ae4]/15 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#8aa3ff]/30 blur-3xl" />

				<div className="relative space-y-6">
					<span className="chip">Event Platform</span>
					<h1 className="display-font max-w-xl font-bold text-4xl text-[#0e1838] leading-tight md:text-6xl">
						Run unforgettable events from discovery to entry.
					</h1>
					<p className="max-w-xl text-[#536081] text-lg">
						UniEvents gives attendees one clear journey: browse events, reserve
						passes, and walk in with a mobile-ready ticket.
					</p>

					<div className="flex flex-wrap gap-3">
						<Button asChild size="lg">
							<Link href="/events">Browse Events</Link>
						</Button>
						<Button asChild variant="ghost" size="lg">
							<Link href="/dashboard">Open Dashboard</Link>
						</Button>
					</div>

					<div className="flex flex-wrap gap-2 pt-2">
						{modulePillars.map((pillar) => (
							<span
								key={pillar}
								className="rounded-full border border-[#d8e2fd] bg-white px-3 py-1 font-medium text-[#30416f] text-xs"
							>
								{pillar}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="panel-soft flex items-center justify-center p-4 md:p-8">
				<Image
					src="/assets/welcome.png"
					alt="Welcome illustration"
					width={510}
					height={660}
					className="h-auto w-full max-w-[360px]"
					priority
				/>
			</div>
		</section>
	);
}
