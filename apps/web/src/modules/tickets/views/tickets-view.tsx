"use client";

import type { EventRecord } from "@unievent/schema";
import {
	Download,
	Loader2,
	MapPin,
	Search,
	Ticket as TicketIcon,
	X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/core/lib/cn";
import { useEvents } from "@/modules/events";
import { Button } from "@/shared/ui/button";
import { MobileTicketPreview } from "../components/mobile-ticket-preview";
import { useTickets } from "../hooks/use-tickets";
import { ticketsService } from "../services/tickets.service";

export function TicketsView() {
	const eventsQuery = useEvents({ limit: 50 });
	const ticketsQuery = useTickets({ limit: 50 });
	const [eventFilter, setEventFilter] = useState("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTicketId, setSelectedTicketId] = useState("");
	const [showMobileSidebar, setShowMobileSidebar] = useState(false);

	const tickets = ticketsQuery.data?.data ?? [];
	const events = eventsQuery.data?.data ?? [];

	const eventMap = useMemo(() => {
		const map = new Map<string, EventRecord>();
		for (const event of events) {
			map.set(event.id, event);
		}
		return map;
	}, [events]);

	const filteredTickets = useMemo(() => {
		return tickets.filter((ticket) => {
			const matchesEvent =
				eventFilter === "ALL" || ticket.eventId === eventFilter;
			const eventName = eventMap.get(ticket.eventId)?.name.toLowerCase() || "";
			const matchesSearch =
				searchQuery === "" ||
				ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				eventName.includes(searchQuery.toLowerCase());
			return matchesEvent && matchesSearch;
		});
	}, [tickets, eventFilter, searchQuery, eventMap]);

	const selectedTicket = useMemo(
		() => tickets.find((t) => t.id === selectedTicketId) || null,
		[tickets, selectedTicketId],
	);

	if (ticketsQuery.isLoading || eventsQuery.isLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
				<Loader2 className="animate-spin" size={32} />
				<p className="font-black text-xs uppercase tracking-widest">
					Syncing Asset Registry...
				</p>
			</div>
		);
	}

	const handleDownloadPDF = async () => {
		if (!selectedTicket?.orderId) return;
		const { toast } = await import("sonner");
		toast.info("Generating encrypted PDF...");

		try {
			const blob = await ticketsService.downloadTicket(selectedTicket.orderId);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = `ticket-${selectedTicket.id.slice(0, 8)}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			toast.success("Asset downloaded.");
		} catch (error) {
			console.error("Failed to download PDF:", error);
			toast.error("Operation failed.");
		}
	};

	return (
		<div className="fade-in animate-in space-y-1 pb-20 duration-500">
			{/* Sharp Header */}
			<div className="flex flex-col justify-between gap-6 border border-[#dbe7ff] bg-white p-4 sm:p-8 xl:flex-row xl:items-end">
				<div className="space-y-2">
					<span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">
						Asset Inventory
					</span>
					<h1 className="font-black text-2xl text-[#071a78] uppercase tracking-tighter sm:text-3xl">
						My Tickets
					</h1>
					<p className="max-w-xl font-bold text-slate-400 text-xs sm:text-sm">
						Verified digital assets for upcoming operations. Manage access codes
						and deployment details.
					</p>
				</div>

				<div className="flex flex-col gap-3 md:flex-row">
					<div className="relative w-full md:w-64">
						<Search
							className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
							size={16}
						/>
						<input
							type="text"
							placeholder="Reference lookup..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-10 w-full border border-[#dbe7ff] bg-white pl-11 font-black text-[10px] uppercase tracking-widest shadow-sm outline-hidden focus:border-[#030370] sm:h-12 sm:text-xs"
						/>
					</div>

					<select
						value={eventFilter}
						onChange={(e) => setEventFilter(e.target.value)}
						className="h-10 border border-[#dbe7ff] bg-white px-4 font-black text-[9px] text-slate-500 uppercase tracking-widest outline-hidden focus:border-[#030370] sm:h-12 sm:text-[10px]"
					>
						<option value="ALL">All Sectors</option>
						{events.map((e) => (
							<option key={e.id} value={e.id}>
								{e.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Content Matrix */}
			<div className="flex flex-col gap-1 xl:flex-row">
				<div className="flex-1 space-y-1">
					{filteredTickets.length === 0 ? (
						<div className="border border-[#dbe7ff] border-dashed bg-white py-12 text-center sm:py-20">
							<TicketIcon className="mx-auto mb-4 h-10 w-10 text-slate-200 sm:h-12 sm:w-12" />
							<p className="px-4 font-black text-[9px] text-slate-400 uppercase tracking-widest">
								No matches found in database
							</p>
						</div>
					) : (
						filteredTickets.map((ticket) => {
							const event = eventMap.get(ticket.eventId);
							const isSelected = selectedTicketId === ticket.id;
							return (
								<button
									type="button"
									key={ticket.id}
									onClick={() => {
										setSelectedTicketId(ticket.id);
										setShowMobileSidebar(true);
									}}
									className={cn(
										"group block w-full border p-3 text-left transition-all sm:p-4",
										isSelected
											? "border-[#030370] bg-[#030370]/5 shadow-inner"
											: "border-[#eff3ff] bg-white hover:bg-slate-50",
									)}
								>
									<div className="flex items-center justify-between gap-3 sm:gap-4">
										<div className="flex min-w-0 items-center gap-3 sm:gap-4">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-white shadow-sm sm:h-12 sm:w-12">
												{event?.thumbnail ? (
													<Image
														src={event.thumbnail}
														alt=""
														width={48}
														height={48}
														className="h-full w-full object-cover"
													/>
												) : (
													<TicketIcon className="text-slate-200" size={16} />
												)}
											</div>
											<div className="min-w-0">
												<h3 className="truncate font-black text-slate-900 text-xs uppercase tracking-tight sm:text-sm">
													{event?.name || "Unidentified Event"}
												</h3>
												<div className="mt-0.5 flex items-center gap-1 font-black text-[8px] text-slate-400 uppercase tracking-widest sm:gap-2 sm:text-[9px]">
													<MapPin size={8} />
													<span className="truncate">
														{event?.venueName || "Sector TBA"}
													</span>
												</div>
											</div>
										</div>
										<div className="shrink-0 text-right">
											<p className="font-black text-slate-900 text-xs tracking-tighter sm:text-sm">
												₹{ticket.pricePaid.toLocaleString("en-IN")}
											</p>
											<p className="font-black text-[8px] text-slate-400 uppercase tracking-widest sm:text-[9px]">
												{ticket.orderId.slice(-4).toUpperCase()}
											</p>
										</div>
									</div>
								</button>
							);
						})
					)}
				</div>

				{/* Detail Access Monitor */}
				<div className="hidden w-96 xl:block">
					{selectedTicket ? (
						<div className="sticky top-20 space-y-1">
							<div className="border border-[#dbe7ff] bg-white p-6">
								<MobileTicketPreview
									ticket={selectedTicket}
									event={eventMap.get(selectedTicket.eventId)}
								/>
							</div>

							<Button
								onClick={handleDownloadPDF}
								className="h-14 w-full gap-3 rounded-none border border-[#dbe7ff] bg-[#030370] font-black text-[10px] text-white uppercase tracking-widest hover:bg-slate-900"
							>
								<Download size={16} /> Export PDF
							</Button>

							<div className="border border-[#dbe7ff] bg-slate-50 p-4 text-center">
								<p className="font-black text-[9px] text-slate-400 uppercase tracking-[0.4em]">
									REF: {selectedTicket.id.toUpperCase()}
								</p>
							</div>
						</div>
					) : (
						<div className="sticky top-20 flex h-[400px] flex-col items-center justify-center border border-[#dbe7ff] border-dashed bg-white p-10 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center bg-slate-50 text-slate-200">
								<TicketIcon size={32} />
							</div>
							<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
								Awaiting Asset Selection
							</p>
							<p className="mt-2 text-[10px] text-slate-300 uppercase">
								Select an entry to view metadata
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Mobile Modal - Sharp Overhaul */}
			{showMobileSidebar && selectedTicket && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<button
						type="button"
						className="absolute inset-0 h-full w-full cursor-default border-none bg-slate-900/60 backdrop-blur-xs"
						onClick={() => setShowMobileSidebar(false)}
						aria-label="Close mobile sidebar"
					/>
					<div className="slide-in-from-bottom absolute right-0 bottom-0 left-0 max-h-[90vh] animate-in overflow-y-auto border-[#030370] border-t-2 bg-white p-8 shadow-2xl duration-300">
						<div className="mb-8 flex items-center justify-between border-slate-100 border-b pb-4">
							<div>
								<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
									Asset Details
								</p>
								<h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
									Entry Protocol
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setShowMobileSidebar(false)}
								className="flex h-10 w-10 items-center justify-center border border-slate-100"
							>
								<X size={20} />
							</button>
						</div>

						<MobileTicketPreview
							ticket={selectedTicket}
							event={eventMap.get(selectedTicket.eventId)}
						/>

						<div className="mt-8">
							<Button
								onClick={handleDownloadPDF}
								className="h-16 w-full gap-3 rounded-none bg-[#030370] font-black text-[10px] text-white uppercase tracking-widest hover:bg-slate-900"
							>
								<Download size={18} /> Export PDF Asset
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
