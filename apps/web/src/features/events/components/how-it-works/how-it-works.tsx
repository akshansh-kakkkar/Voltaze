"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

export function HowItWorks() {
	const [activeStep, setActiveStep] = useState(1);

	const STEPS = [
		{
			id: 1,
			title: "Find something you love",
			description:
				'Search by name, filter by category, date, or "free entry". Save events to revisit them later',
		},
		{
			id: 2,
			title: "Pick your tickets",
			description:
				"Choose ticket type and quality. Solo or as a group. Apply coupons for group or early bird discounts.",
		},
		{
			id: 3,
			title: "Pay in seconds",
			description:
				"Secure Cashfree checkouts. UPI, cards and netbanking all supported. Payment confirmed instantly.",
		},
		{
			id: 4,
			title: "Show up, scan, enjoy",
			description:
				"Your QR pass lands on WhatsApp & email immediately. At the gate, one scan- and you're in.",
		},
	];

	return (
		<section className="w-full border-slate-100/50 border-t bg-[#EBF3FF] py-24">
			<div className="mx-auto max-w-7xl px-6">
				<div className="flex flex-col items-start gap-16 lg:flex-row lg:gap-24">
					<div className="w-full max-w-2xl flex-1">
						<div className="mb-8 flex items-center gap-4">
							<div className="h-0.5 w-8 bg-[#080880]/40" />
							<span className="font-bold text-[#080880] text-xs uppercase tracking-widest">
								How It Works
							</span>
							<div className="h-0.5 max-w-105 flex-1 bg-[#080880]/40" />
						</div>

						<h2 className="mb-6 font-black text-5xl text-[#1e293b] tracking-tight md:text-6xl">
							Book your seat in{" "}
							<span className="text-[#1010a3]">4 simple steps</span>
						</h2>

						<p className="mb-16 font-semibold text-[#64748b] text-[17px]">
							Designed to get you from “interested” to “confirmed” with minimum
							friction.
						</p>

						<div className="flex flex-col gap-10">
							{STEPS.map((step) => {
								const isActive = step.id === activeStep;
								return (
									<button
										type="button"
										key={step.id}
										onClick={() => setActiveStep(step.id)}
										className="group flex w-full items-start gap-4 text-left sm:items-center sm:gap-6 lg:gap-8"
									>
										<div className="relative flex-shrink-0">
											{isActive && (
												<div className="absolute top-1/2 -left-3 h-12 w-1 -translate-y-1/2 rounded-full bg-[#2563EB] sm:-left-4 sm:h-14 sm:w-1.5 lg:-left-6 lg:h-15" />
											)}
											<div
												className={cn(
													"flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-black text-3xl transition-all duration-300 sm:h-20 sm:w-20 sm:rounded-[24px] sm:text-4xl lg:h-24 lg:w-24 lg:rounded-[28px] lg:text-5xl",
													isActive
														? "bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(41,98,255,0.4)]"
														: "bg-[#e5ecf6] text-[#9ca3af] shadow-[0_12px_40px_rgba(20,40,70,0.06)] group-hover:bg-[#dfe7f3] group-hover:shadow-[0_16px_40px_rgba(41,98,255,0.1)]",
												)}
											>
												{step.id}
											</div>
										</div>
										<div className="min-w-0 flex-1 pt-0 sm:pt-1">
											<h3 className="mb-1 font-bold text-[#1e293b] text-sm leading-tight sm:mb-2 sm:text-base lg:text-xl">
												{step.title}
											</h3>
											<p className="font-medium text-[#64748b] text-xs leading-relaxed sm:text-sm lg:text-base">
												{step.description}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					<div className="sticky top-20 hidden items-center justify-center pt-8 sm:top-24 sm:pt-12 lg:flex lg:w-[45%] xl:w-[50%]">
						<div className="relative w-full max-w-xs rounded-3xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2)] sm:rounded-[40px] sm:shadow-[0_30px_60px_rgba(0,0,0,0.3)] lg:max-w-sm lg:rounded-[50px] xl:max-w-md">
							<Image
								src="/assets/iphone.webp"
								alt="iPhone Ticket Mockup"
								width={680}
								height={1380}
								className="h-auto w-full rounded-3xl sm:rounded-[40px] lg:rounded-[50px]"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
