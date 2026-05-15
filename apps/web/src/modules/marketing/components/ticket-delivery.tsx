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
		<section className="w-full bg-[#EBF3FF] py-24">
			<div className="mx-auto max-w-7xl px-6">
				<div className="mb-8 flex items-center gap-4">
					<div className="h-0.5 w-8 bg-[#080880]/40" />
					<span className="font-bold text-[#080880] text-xs uppercase tracking-widest">
						Your Ticket					</span>
					<div className="h-0.5 max-w-105 flex-1 bg-[#080880]/40" />
				</div>

				<h2 className="mb-6 capitalize font-black text-5xl text-[#1e293b] tracking-tight md:text-6xl">
					delivered to you{" "}
					<span className="text-[#1010a3]">the second you book</span>
				</h2>

				<p className="mb-16 font-semibold text-[#64748b] text-[17px]">
					No Printing, No Hunting for emails. Your ticket is wherever you are.
				</p>
				<div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
					<div className="order-2 flex flex-col gap-8 lg:order-1">
						{FEATURES.map((feature) => (
							<div
								key={feature.id}
								className="flex gap-6 rounded-4xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:shadow-xl"
							>
								<div
									className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${feature.bgColor}`}
								>
									<feature.Icon
										className={`h-7 w-7 ${feature.iconColor}`}
										strokeWidth={1.5}
									/>
								</div>
								<div>
									<h3 className="mb-1 font-extrabold text-2xl text-black">
										{feature.title}
									</h3>
									<p className="font-semibold text-base text-slate-400 leading-relaxed">
										{feature.description}
									</p>
								</div>
							</div>
						))}
					</div>

					<div className="order-1 flex items-center justify-center lg:order-2">
						<div className="relative w-85 rounded-[50px] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
							<div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-[#030370]/5 blur-3xl" />
							<Image
								src="/assets/iphone.webp"
								alt="iPhone Ticket Mockup"
								width={680}
								height={1380}
								className="h-auto w-full drop-shadow-2xl"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
