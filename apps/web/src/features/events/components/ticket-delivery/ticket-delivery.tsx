import { Bell, Lock, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";

const FEATURES = [
	{
		id: 1,
		title: "WhatsApp Delivery",
		description:
			"QR pass lands in your whatsapp instantly after payment. Always within reach",
		Icon: MessageCircle,
		iconColor: "text-green-500",
		bgColor: "bg-green-50",
	},
	{
		id: 2,
		title: "Email PDF Ticket",
		description:
			"A beautifully formatted PDF ticket in your inbox — download or open on the day",
		Icon: Mail,
		iconColor: "text-red-500",
		bgColor: "bg-red-50",
	},
	{
		id: 3,
		title: "Day-before reminder",
		description:
			"We ping you via WhatsApp the day before so you never forget something you paid for.",
		Icon: Bell,
		iconColor: "text-yellow-500",
		bgColor: "bg-yellow-50",
	},
	{
		id: 4,
		title: "Temper-proof QR",
		description:
			"Every QR is cryptographically signed. No duplicates, no fakes — instant gate scan.",
		Icon: Lock,
		iconColor: "text-amber-600",
		bgColor: "bg-amber-50",
	},
];

export function TicketDelivery() {
	return (
		<section className="w-full bg-[#EBF3FF] py-12 sm:py-16 md:py-20 lg:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-3 text-center sm:mb-4">
					<span className="font-bold text-[#030370] text-xs uppercase tracking-widest">
						Your Ticket
					</span>
				</div>

				<h2 className="mb-4 text-center font-extrabold text-2xl text-black leading-tight tracking-tighter sm:mb-6 sm:text-3xl md:text-5xl lg:text-6xl">
					Delivered to you{" "}
					<span className="text-[#030370]">the second you book</span>
				</h2>

				<p className="mx-auto mb-8 max-w-2xl text-center font-semibold text-slate-400 text-sm leading-relaxed sm:mb-12 sm:text-base md:text-lg lg:mb-16">
					No printing, no hunting for emails. Your ticket is wherever you are.
				</p>

				<div className="grid grid-cols-1 items-start gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
					<div className="order-2 flex flex-col gap-4 sm:gap-6 lg:order-1">
						{FEATURES.map((feature) => (
							<div
								key={feature.id}
								className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-3 transition-all duration-300 hover:shadow-lg sm:gap-6 sm:rounded-3xl sm:p-4 sm:hover:shadow-xl md:p-6 lg:rounded-4xl"
							>
								<div
									className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl md:h-14 md:w-14 md:rounded-2xl ${feature.bgColor}`}
								>
									<feature.Icon
										className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${feature.iconColor}`}
										strokeWidth={1.5}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="mb-0.5 font-extrabold text-base text-black leading-tight sm:mb-1 sm:text-lg md:text-2xl">
										{feature.title}
									</h3>
									<p className="font-semibold text-slate-400 text-xs leading-relaxed sm:text-sm md:text-base">
										{feature.description}
									</p>
								</div>
							</div>
						))}
					</div>

					<div className="order-1 flex w-full items-center justify-center lg:order-2">
						<div className="relative w-full max-w-[280px] rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] sm:max-w-xs sm:rounded-3xl sm:shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:max-w-sm lg:max-w-md lg:rounded-[50px] lg:shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
							<div className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-[#030370]/5 blur-2xl sm:rounded-3xl sm:blur-3xl lg:rounded-[50px]" />
							<Image
								src="/assets/iphone.webp"
								alt="iPhone Ticket Mockup"
								width={680}
								height={1380}
								className="h-auto w-full rounded-2xl drop-shadow-xl sm:rounded-3xl sm:drop-shadow-2xl lg:rounded-[50px]"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
