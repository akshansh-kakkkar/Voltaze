import { Bell, MessageCircle, ShieldCheck, Undo2, Zap } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
	return (
		<section className="w-full border-slate-100 border-t bg-[#EBF3FF] py-12 sm:py-16 md:py-20 lg:py-24">
			<div className="mx-auto max-w-[1280px] px-4 text-center sm:px-6 lg:px-8">
				<h2 className="mx-auto mb-6 max-w-4xl font-extrabold text-2xl text-black leading-tight tracking-tighter sm:mb-8 sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl">
					Your next unforgettable{" "}
					<span className="text-[#06069A]">experience is out there.</span>
				</h2>

				<p className="mx-auto mb-8 max-w-3xl font-semibold text-slate-400 text-sm leading-relaxed sm:mb-12 sm:text-base md:text-lg lg:text-xl">
					Join 85,000+ attendees who discover and book events on Voltaze every
					month. Free to join, free to explore.
				</p>

				<div className="mb-12 flex flex-col items-center justify-center gap-2 sm:mb-16 sm:flex-row sm:gap-3 lg:mb-20">
					<Button
						asChild
						size="lg"
						className="h-12 w-full rounded-full bg-[#030370] px-6 font-bold text-sm text-white shadow-lg transition-all hover:bg-[#030370]/90 active:scale-95 sm:h-14 sm:w-auto sm:px-8 sm:text-base lg:h-16 lg:px-12 lg:text-lg lg:shadow-xl"
					>
						<Link href="/events">Browse Events</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="h-12 w-full rounded-full border-slate-200 bg-white px-6 font-bold text-slate-600 text-sm transition-all hover:border-[#030370] hover:text-[#030370] active:scale-95 sm:h-14 sm:w-auto sm:px-8 sm:text-base lg:h-16 lg:px-12 lg:text-lg"
					>
						<Link href={"/host/events/new" as Route}>Create Free Events</Link>
					</Button>
				</div>

				<div className="mx-auto max-w-4xl">
					<div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:mb-8 sm:gap-x-8 sm:gap-y-6 lg:gap-x-12">
						<div className="flex items-center gap-2 font-bold text-slate-500 text-xs sm:text-sm md:text-base">
							<ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" /> Secure Payments
						</div>
						<div className="flex items-center gap-2 font-bold text-slate-500 text-xs sm:text-sm md:text-base">
							<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" /> WhatsApp
							Delivery
						</div>
						<div className="flex items-center gap-2 font-bold text-slate-500 text-xs sm:text-sm md:text-base">
							<Zap className="h-4 w-4 fill-yellow-500 text-yellow-500 sm:h-5 sm:w-5" />{" "}
							Instant QR Pass
						</div>
						<div className="flex items-center gap-2 font-bold text-slate-500 text-xs sm:text-sm md:text-base">
							<Bell className="h-4 w-4 sm:h-5 sm:w-5" /> Event reminders
						</div>
					</div>
					<div className="flex items-center justify-center">
						<div className="flex items-center gap-2 font-bold text-slate-500 text-xs sm:text-sm md:text-base">
							<Undo2 className="h-4 w-4 sm:h-5 sm:w-5" /> Easy Cancellation
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
