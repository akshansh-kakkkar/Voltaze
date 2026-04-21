"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { TicketRecord } from "@unievent/schema";
import { useEvents } from "@/modules/events";
import { useTickets } from "../hooks/use-tickets";
import { Button } from "@/shared/ui/button";
import { SectionTitle } from "@/shared/ui/section-title";
import { MobileTicketPreview } from "../components/mobile-ticket-preview";

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function TicketsView() {
	const eventsQuery = useEvents({ limit: 100 });
	const ticketsQuery = useTickets({ limit: 100 });
	const [eventFilter, setEventFilter] = useState("ALL");
	const [selectedTicketId, setSelectedTicketId] = useState("");

	const tickets = ticketsQuery.data?.data ?? [];
	const events = eventsQuery.data?.data ?? [];

	const filteredTickets = useMemo(() => {
		if (eventFilter === "ALL") {
			return tickets;
		}

		return tickets.filter((ticket) => ticket.eventId === eventFilter);
	}, [tickets, eventFilter]);

	const selectedTicket =
		filteredTickets.find((ticket) => ticket.id === selectedTicketId) ??
		filteredTickets[0] ??
		null;

	useEffect(() => {
		if (filteredTickets.length === 0) {
			return;
		}

		const selectedExists = filteredTickets.some((ticket) => ticket.id === selectedTicketId);
		if (!selectedExists) {
			setSelectedTicketId(filteredTickets[0].id);
		}
	}, [filteredTickets, selectedTicketId]);

	const ticketStats = useMemo(() => {
		const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.pricePaid, 0);
		const uniqueEvents = new Set(tickets.map((ticket) => ticket.eventId)).size;

		return {
			total: tickets.length,
			totalRevenue,
			uniqueEvents,
		};
	}, [tickets]);

	if (ticketsQuery.isLoading || eventsQuery.isLoading) {
		return <div className="panel-soft p-6 text-[#5f6984]">Loading tickets...</div>;
	}

	if (ticketsQuery.isError || eventsQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load tickets right now.
			</div>
		);
	}

	return (
		<div className="grid items-start gap-6 lg:grid-cols-[1fr_440px]">
			<section className="panel space-y-6 p-6 md:p-8">
				<SectionTitle
					eyebrow="Tickets"
					title="Manage every pass from one ticket hub"
					description="Filter by event, switch between issued tickets, and preview each mobile-ready pass before entry day."
				/>

				<div className="grid gap-4 sm:grid-cols-4">
					<Fact label="Total passes" value={String(ticketStats.total)} />
					<Fact label="Events" value={String(ticketStats.uniqueEvents)} />
					<Fact label="Revenue" value={new Intl.NumberFormat("en", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(ticketStats.totalRevenue)} />
					<Fact label="Latest issue" value={filteredTickets[0] ? formatDateTime(filteredTickets[0].createdAt) : "-"} />
				</div>

				<div className="flex flex-wrap items-end gap-4">
					<label className="min-w-[220px] flex-1 space-y-2">
						<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							Filter by event
						</span>
						<select
							value={eventFilter}
							onChange={(event) => setEventFilter(event.target.value)}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-3 text-sm text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						>
								<option value="ALL">All events</option>
							{events.map((event) => (
								<option key={event.id} value={event.id}>
									{event.name}
								</option>
							))}
						</select>
					</label>

					<Button
						type="button"
						variant="ghost"
						onClick={() => setEventFilter("ALL")}
					>
						Show all
					</Button>
				</div>

				<div className="space-y-3">
					<p className="font-semibold text-[#253056] text-sm">
						{filteredTickets.length} {filteredTickets.length === 1 ? "ticket" : "tickets"} shown
					</p>

					{filteredTickets.length === 0 ? (
						<div className="rounded-xl border border-[#d7e0f8] bg-[#f7faff] p-4 text-[#5f6984] text-sm">
							No tickets found for this event. Switch filters to continue.
						</div>
					) : (
						<div className="grid gap-3">
							{filteredTickets.map((ticket) => (
								<TicketRow
									key={ticket.id}
									ticket={ticket}
									active={selectedTicket?.id === ticket.id}
									onSelect={setSelectedTicketId}
								/>
							))}
						</div>
					)}
				</div>

				<div className="panel-soft flex items-center gap-4 p-4">
					<Image
						src="/assets/logoo.svg"
						alt="Ticket operations icon"
						width={56}
						height={56}
					/>
					<p className="text-[#4f5a78] text-sm leading-relaxed">
						Each pass card is optimized for quick check-in. Use the active list
						to verify attendee status before event entry opens.
					</p>
				</div>
			</section>

			{selectedTicket ? (
				<div className="space-y-4">
					<MobileTicketPreview ticket={selectedTicket} />
					<div className="panel-soft flex flex-wrap gap-2 p-3">
						<Button type="button" size="sm">Download pass</Button>
						<Button type="button" variant="ghost" size="sm">
							Share pass link
						</Button>
					</div>
				</div>
			) : (
				<div className="panel-soft p-6 text-center text-[#5f6984] text-sm">
					Choose a ticket from the list to open the mobile preview.
				</div>
			)}
		</div>
	);
}

function Fact({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
			<p className="font-semibold text-[#7a86a8] text-xs uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-1 font-semibold text-[#1e2a4d] text-sm">{value}</p>
		</div>
	);
}

function TicketRow({
	ticket,
	active,
	onSelect,
}: {
	ticket: TicketRecord;
	active: boolean;
	onSelect: (ticketId: string) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onSelect(ticket.id)}
			className={`w-full rounded-xl border p-4 text-left transition-colors ${
				active
					? "border-[#2b4ccc] bg-[#eaf0ff]"
					: "border-[#d7e0f8] bg-white hover:bg-[#f8faff]"
			}`}
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="font-semibold text-[#1e2a4d] text-sm">{ticket.id}</p>
				<span className="rounded-full bg-[#edf2ff] px-2.5 py-1 font-semibold text-[#2b4ccc] text-xs">
					{ticket.tierId}
				</span>
			</div>
			<p className="mt-1 text-[#5f6984] text-sm">
				Created {formatDateTime(ticket.createdAt)}
			</p>
			<p className="mt-1 text-[#5f6984] text-xs">Order: {ticket.orderId}</p>
		</button>
	);
}
