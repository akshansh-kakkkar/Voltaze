import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GroupBooking() {
	return (
		<section className="w-full bg-[#EBF3FF] py-8 sm:py-10 md:py-12 lg:py-16">
			<div className={"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}>
				<div className="group relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl bg-[#030370] p-4 sm:gap-8 sm:rounded-3xl sm:p-6 md:gap-10 md:rounded-[40px] md:p-8 lg:gap-12 lg:rounded-[48px] lg:p-20">
					<div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/5 blur-3xl transition-transform duration-500 group-hover:scale-110" />
					<div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

					<div className="relative z-10 max-w-2xl text-center lg:text-left">
						<div className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 font-bold text-white text-xs uppercase tracking-wider backdrop-blur-md sm:mb-6 sm:px-4 sm:py-1.5">
							Group Booking
						</div>

						<h2 className="mb-3 font-extrabold text-2xl text-white leading-tight tracking-tighter sm:mb-4 sm:text-3xl sm:leading-[1.05] md:text-4xl lg:mb-6 lg:text-5xl xl:text-6xl">
							Coming with your crew?
							<br className="hidden sm:block" />
							Save more together.
						</h2>

						<p className="mb-6 font-medium text-slate-300 text-sm leading-relaxed sm:mb-8 sm:text-base md:mb-10 md:text-lg">
							Book 5+ Tickets In A Single Transaction And Unlock Automatic
							Discounts. One Payment — Everyone Gets Their Own QR Pass
							Instantly.
						</p>

						<div className="inline-block rounded-xl bg-white px-4 py-2 font-bold text-[#030370] text-xs shadow-lg transition-transform group-hover:-rotate-0 sm:-rotate-1 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-base md:text-lg lg:text-xl lg:shadow-xl">
							Get Upto 20% Off
						</div>
					</div>

					<div className="relative z-10 flex w-full flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3 md:gap-4 lg:w-auto lg:gap-3">
						<Button
							asChild
							className="h-10 w-full rounded-full bg-white px-6 font-bold text-[#030370] text-xs shadow-lg transition-all hover:bg-slate-100 active:scale-95 sm:h-12 sm:w-auto sm:px-8 sm:text-sm md:h-14 md:text-base lg:px-10 lg:text-lg"
						>
							<Link href="/events">
								Book Now <ArrowRight size={16} className="ml-1 sm:ml-2" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="h-10 w-full rounded-full border-white/20 px-6 font-bold text-white text-xs backdrop-blur-sm transition-all hover:bg-white/10 sm:h-12 sm:w-auto sm:px-8 sm:text-sm md:h-14 md:text-base lg:px-10 lg:text-lg"
						>
							<Link
								href={{ pathname: "/faq", query: { tab: "group-booking" } }}
							>
								Learn More
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
