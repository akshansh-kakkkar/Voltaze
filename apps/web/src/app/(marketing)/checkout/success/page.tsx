"use client";

import {
	CheckCircle2,
	ChevronRight,
	Download,
	Loader2,
	Mail,
	Share2,
	ShieldCheck,
	Ticket,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Suspense, useEffect, useRef } from "react";
import { cn } from "@/core/lib/cn";
import { useCart } from "@/core/providers/cart-provider";
import { ordersService } from "@/modules/orders/services/orders.service";
import { usePayment } from "@/modules/payments/hooks/use-payments";

function CheckoutSuccessContent() {
	const { clearCart } = useCart();
	const searchParams = useSearchParams();
	const paymentId = searchParams.get("paymentId");
	const {
		data: payment,
		isLoading,
		error,
	} = usePayment(paymentId ?? undefined);
	const qrCodeRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

	useEffect(() => {
		// Clear the cart on successful order
		clearCart();
	}, [clearCart]);

	const order = payment?.order;
	const tickets = order?.tickets ?? [];
	const event = order?.event;
	const attendee = order?.attendee;

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
				<Loader2 className="h-8 w-8 animate-spin text-[#000031]" />
			</div>
		);
	}

	if (error || !payment) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
				<div className="text-center">
					<p className="font-black text-2xl text-[#000031]">
						Payment not found or invalid
					</p>
					<Link
						href="/dashboard"
						className="mt-4 inline-block font-black text-blue-600 text-sm underline"
					>
						Go to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	if (payment.status !== "SUCCESS") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
				<div className="text-center">
					<p className="font-black text-2xl text-[#000031]">
						Payment not completed
					</p>
					<Link
						href="/dashboard"
						className="mt-4 inline-block font-black text-blue-600 text-sm underline"
					>
						Go to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	const handleDownloadPDF = async () => {
		if (!order?.id) return;

		const { toast } = await import("sonner");
		toast.info("Preparing your download...");

		try {
			const blob = await ordersService.downloadTicket(order.id);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = `ticket-${order.id.slice(0, 8)}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			toast.success("Download started!");
		} catch (error) {
			console.error(error);
			toast.error("Failed to download PDF. Please try printing instead.");
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#fcfcfc] pt-20 pb-16 font-jakarta text-[#000031] sm:pt-24 sm:pb-32">
			{/* Structural Background */}
			<div className="absolute top-0 left-0 h-1 w-full bg-[#000031]" />
			<div className="pointer-events-none absolute top-0 right-0 hidden h-screen w-1/3 border-slate-100 border-l bg-slate-50/50 sm:block" />

			<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
					{/* Main Confirmation Area */}
					<div className="space-y-8 lg:col-span-7 lg:space-y-12">
						{/* Status Header */}
						<div className="space-y-4 sm:space-y-6">
							<div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-600 shadow-sm sm:gap-3 sm:px-4 sm:py-2">
								<ShieldCheck
									size={14}
									strokeWidth={3}
									className="h-3 w-3 sm:h-[14px] sm:w-[14px]"
								/>
								<span className="font-black text-[8px] uppercase tracking-[0.2em] sm:text-[10px]">
									Transaction Protocol Verified
								</span>
							</div>

							<div className="space-y-2">
								<h1 className="font-black text-4xl leading-[0.85] tracking-tighter sm:text-5xl lg:text-6xl">
									REGISTRATION <br />
									<span className="text-slate-300">COMPLETE.</span>
								</h1>
								<p className="max-w-xl font-medium text-base text-slate-500 leading-relaxed sm:text-lg">
									The system has finalized your allocation. Your digital access
									keys are now active and available for sync with your mobile
									device.
								</p>
							</div>
						</div>

						{/* Ticket Manifest Card */}
						<div className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 sm:rounded-[32px] lg:rounded-[40px]">
							<div className="space-y-6 p-4 sm:space-y-10 sm:p-6 lg:p-12">
								<div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
									<div className="min-w-0 space-y-1">
										<p className="font-black text-[8px] text-slate-400 uppercase tracking-widest sm:text-[10px]">
											Order Identifier
										</p>
										<p className="truncate font-black font-mono text-xl sm:text-2xl lg:text-3xl">
											{order?.id}
										</p>
									</div>
									<div className="flex shrink-0 gap-2">
										<button
											type="button"
											onClick={handleDownloadPDF}
											className="flex h-9 items-center gap-2 rounded-xl bg-[#000031] px-4 font-black text-[8px] text-white uppercase tracking-widest shadow-[#000031]/20 shadow-lg transition-all hover:bg-[#000031]/90 sm:h-10 sm:text-[10px]"
										>
											<Download
												size={14}
												className="h-3 w-3 sm:h-[14px] sm:w-[14px]"
											/>{" "}
											Download Ticket Asset
										</button>
									</div>
								</div>

								<div className="h-px w-full bg-slate-100" />

								{/* Ticket View */}
								{tickets.map((ticket) => (
									<div
										key={ticket.id}
										id={`ticket-${ticket.id}`}
										className="relative overflow-hidden rounded-[32px] bg-[#000031] p-8 text-white"
									>
										{/* Decorative "Punch Hole" */}
										<div className="absolute top-1/2 -left-4 h-8 w-8 -translate-y-1/2 rounded-full bg-[#fcfcfc]" />
										<div className="absolute top-1/2 -right-4 h-8 w-8 -translate-y-1/2 rounded-full bg-[#fcfcfc]" />
										<div className="absolute top-1/2 right-8 left-8 -translate-y-1/2 border-white/20 border-t border-dashed" />

										<div className="relative z-10 flex flex-col justify-between gap-12 md:flex-row">
											<div className="space-y-6">
												<div>
													<p className="mb-1 font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
														Event
													</p>
													<p className="font-bold text-xl tracking-tight">
														{event?.name}
													</p>
												</div>
												<div>
													<p className="mb-1 font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
														Ticket Type
													</p>
													<p className="font-bold text-lg tracking-tight">
														{ticket.tier?.name}
													</p>
												</div>
												<div className="flex gap-8">
													<div>
														<p className="mb-1 font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
															Attendee
														</p>
														<p className="font-bold text-xs uppercase tracking-widest">
															{attendee?.name}
														</p>
													</div>
													<div>
														<p className="mb-1 font-black text-[9px] text-white/40 uppercase tracking-[0.2em]">
															Ticket ID
														</p>
														<p className="font-bold text-xs uppercase tracking-widest">
															{ticket.id.slice(0, 8)}
														</p>
													</div>
												</div>
											</div>
											{ticket.pass?.code && (
												<div className="h-32 w-32 shrink-0 self-center rounded-2xl bg-white p-2 md:self-auto">
													<QRCodeCanvas
														ref={(el) => {
															if (el) qrCodeRefs.current[ticket.id] = el;
														}}
														value={ticket.pass.code}
														size={112}
														level="H"
														includeMargin={false}
														className="h-full w-full"
													/>
												</div>
											)}
										</div>
									</div>
								))}

								<div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2">
									<div className="flex items-start gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
											<Mail size={18} />
										</div>
										<div>
											<h4 className="font-bold text-sm">Email Dispatch</h4>
											<p className="text-slate-500 text-xs leading-relaxed">
												A confirmation node has been sent to your primary
												mailbox.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
											<Ticket size={18} />
										</div>
										<div>
											<h4 className="font-bold text-sm">Mobile Sync</h4>
											<p className="text-slate-500 text-xs leading-relaxed">
												Use the UniEvent Mobile app for live entry protocol.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Side Content / Lifecycle */}
					<div className="space-y-12 lg:col-span-5">
						{/* Registration Lifecycle */}
						<div className="space-y-8 pt-4">
							<h3 className="font-black text-slate-400 text-xs uppercase tracking-[0.3em]">
								Registration Lifecycle
							</h3>

							<div className="relative space-y-10">
								<div className="absolute top-2 bottom-2 left-4 w-px bg-slate-100" />

								{[
									{
										title: "Booking Received",
										status: "Completed",
										icon: CheckCircle2,
										active: true,
									},
									{
										title: "Payment Verified",
										status: "Completed",
										icon: CheckCircle2,
										active: true,
									},
									{
										title: "Identity Validated",
										status: "Completed",
										icon: CheckCircle2,
										active: true,
									},
									{
										title: "Ticket Generated",
										status: "Ready",
										icon: Ticket,
										active: false,
									},
								].map((step, i) => (
									<div key={i} className="relative flex gap-6">
										<div
											className={cn(
												"z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
												step.active
													? "bg-emerald-500 text-white"
													: "border border-slate-200 bg-white text-slate-300",
											)}
										>
											<step.icon size={14} strokeWidth={3} />
										</div>
										<div className="space-y-1">
											<p className="font-black text-sm uppercase tracking-widest">
												{step.title}
											</p>
											<p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">
												{step.status}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Quick Actions */}
						<div className="space-y-6 rounded-[40px] border border-slate-100 bg-slate-50 p-8">
							<h3 className="font-black text-sm uppercase tracking-widest">
								Next Operations
							</h3>
							<div className="space-y-3">
								<Link
									href="/tickets"
									className="!text-white flex h-14 w-full items-center justify-between rounded-2xl bg-[#000031] px-6 transition-all hover:scale-[1.02] active:scale-95"
								>
									<span className="font-black text-[10px] uppercase tracking-widest">
										View My Tickets
									</span>
									<ChevronRight size={16} />
								</Link>
								<Link
									href="/discover"
									className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 text-[#000031] transition-all hover:bg-slate-50"
								>
									<span className="font-black text-[10px] uppercase tracking-widest">
										Explore More Events
									</span>
									<ChevronRight size={16} />
								</Link>
							</div>
						</div>

						{/* Community Shoutout */}
						<div className="group relative cursor-pointer overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-blue-600/20 shadow-xl">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
							<div className="relative z-10 space-y-4">
								<h4 className="font-black text-xl leading-tight">
									Share the hype.
								</h4>
								<p className="font-medium text-white/70 text-xs leading-relaxed">
									Let your circle know you're headed to the most anticipated
									event on campus.
								</p>
								<div className="flex gap-2 pt-2">
									<button
										type="button"
										className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-6 font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-white/20"
									>
										<Share2 size={12} /> Share Now
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
					<div className="text-center">
						<Loader2 className="mx-auto h-12 w-12 animate-spin text-[#000031]" />
						<p className="mt-4 font-semibold text-[#5f6984]">
							Initializing secure session...
						</p>
					</div>
				</div>
			}
		>
			<CheckoutSuccessContent />
		</Suspense>
	);
}
