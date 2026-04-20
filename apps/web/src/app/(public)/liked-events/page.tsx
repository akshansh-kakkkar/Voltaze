import { Heart } from "lucide-react";
import { LikedEventsList } from "@/features/events/components/liked-events-list/liked-events-list";
import { Navbar } from "@/shared/ui/navbar";
import { UserSidebar } from "@/shared/ui/user-sidebar";

export default function LikedEventsPage() {
	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			<Navbar />
			<UserSidebar />
			<main className="fixed top-16 right-0 bottom-0 left-0 md:left-64 overflow-y-auto overflow-x-hidden">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-[#d7e8ff]/70 via-[#e9f2ff]/35 to-transparent"
				/>
				<div className="relative px-6 pt-2 pb-6 md:px-8 md:pt-3 md:pb-8">
					<section className="mb-8 rounded-3xl border border-[#e5ebff] bg-white/85 p-6 shadow-sm backdrop-blur-sm">
						<div className="flex items-center gap-3">
							<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
								<Heart className="h-5 w-5" />
							</div>
							<div>
								<p className="font-bold text-2xl text-[#0d1a55]">Liked Events</p>
								<p className="text-slate-600 text-sm">
									Your saved events in one place.
								</p>
							</div>
						</div>
					</section>

					<LikedEventsList />
				</div>
			</main>
		</div>
	);
}
