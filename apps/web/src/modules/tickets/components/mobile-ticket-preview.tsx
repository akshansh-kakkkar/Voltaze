"use client";

import type { EventRecord, TicketRecord } from "@unievent/schema";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface MobileTicketPreviewProps {
	ticket: TicketRecord;
	event?: EventRecord;
}

export function MobileTicketPreview({
	ticket,
	event,
}: MobileTicketPreviewProps) {
	const bookingDate = new Date(ticket.createdAt);

	const eventStartDate = event?.startDate
		? new Date(event.startDate).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
			})
		: "";

	const eventEndDate = event?.endDate
		? new Date(event.endDate).toLocaleDateString("en-US", {
				day: "numeric",
				year: "numeric",
			})
		: "";

	const eventStartTime = event?.startDate
		? format(new Date(event.startDate), "hh:mm a")
		: "";
	const eventEndTime = event?.endDate
		? format(new Date(event.endDate), "hh:mm a")
		: "";

	const eventDateStr =
		eventStartDate && eventEndDate
			? `${eventStartDate} to ${eventEndDate}`
			: eventStartDate || "";

	const eventTimeStr =
		eventStartTime && eventEndTime
			? `(${eventStartTime} to ${eventEndTime} IST)`
			: eventStartTime
				? `(${eventStartTime} IST)`
				: "";

	return (
		<div className="flex w-full flex-col overflow-hidden rounded-none border border-[#dbe7ff] bg-white">
			{/* Top Section - Metadata */}
			<div className="flex flex-col items-center justify-between gap-6 border-slate-50 border-b p-4 sm:flex-row sm:items-start sm:p-6">
				<div className="flex-1 space-y-1 text-center sm:text-left">
					<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
						Registry Date
					</p>
					<p className="font-black text-[#030370] text-sm uppercase">
						{format(bookingDate, "dd MMM yyyy")}
					</p>
					<div className="pt-2">
						<p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
							Order Identifier
						</p>
						<p className="font-black font-mono text-slate-900 text-xs tracking-tighter">
							ORD-
							{ticket.orderId?.slice(-8).toUpperCase() ||
								ticket.id.slice(-8).toUpperCase()}
						</p>
					</div>
				</div>
				<div className="shrink-0 border border-slate-100 bg-white p-2 shadow-inner">
					<QRCodeSVG
						value={ticket.id}
						size={100}
						level="H"
						includeMargin={false}
						className="h-24 w-24 sm:h-28 sm:w-28"
					/>
				</div>
			</div>

			{/* Operational Asset Details */}
			<div className="space-y-5 bg-slate-50/30 p-4 sm:p-6">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<p className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
							Sector
						</p>
						<p className="truncate font-black text-[11px] text-slate-900 uppercase sm:text-xs">
							{event?.name || "Unknown"}
						</p>
					</div>
					<div className="space-y-1 text-right">
						<p className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
							Access Level
						</p>
						<p className="font-black text-[#030370] text-[11px] uppercase sm:text-xs">
							{ticket.tierId.split("_").pop() || "Standard"}
						</p>
					</div>
				</div>

				<div className="space-y-1">
					<p className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
						Deployment Window
					</p>
					<p className="font-black text-[11px] text-slate-900 uppercase sm:text-xs">
						{eventDateStr}
					</p>
					<p className="font-bold text-[10px] text-slate-400 uppercase">
						{eventTimeStr}
					</p>
				</div>

				<div className="space-y-1">
					<p className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
						Deployment Zone
					</p>
					<div className="flex items-start gap-1.5">
						<MapPin size={10} className="mt-0.5 text-slate-400" />
						<p className="font-black text-[11px] text-slate-900 uppercase leading-tight sm:text-xs">
							{event?.venueName || "Sector TBA"}
						</p>
					</div>
				</div>
			</div>

			{/* Authentication Footer */}
			<div className="border-[#dbe7ff] border-t bg-white p-4 text-center">
				<div className="mb-2 flex items-center justify-center gap-3">
					<div className="h-[1px] flex-1 bg-slate-100" />
					<p className="font-black text-[8px] text-slate-300 uppercase tracking-[0.4em]">
						Authorized Protocol
					</p>
					<div className="h-[1px] flex-1 bg-slate-100" />
				</div>
				<p className="font-black text-[#000031] text-base uppercase tracking-tighter">
					UniEvent
				</p>
			</div>
		</div>
	);
}
