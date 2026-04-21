import Image from "next/image";
import type { TicketRecord } from "@unievent/schema";

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function MobileTicketPreview({ ticket }: { ticket: TicketRecord }) {
	return (
		<div className="panel-soft w-full overflow-hidden p-4 md:p-6">
			<div className="mx-auto w-full max-w-[360px] rounded-[2rem] border border-[#d6def4] bg-white p-3 shadow-[0_26px_54px_rgba(10,30,90,0.2)]">
				<div className="overflow-hidden rounded-[1.5rem] border border-[#d6def4]">
					<div className="bg-gradient-to-br from-[#1264db] to-[#0e43b9] px-4 py-5 text-white">
						<p className="text-xs opacity-85">Your ticket</p>
						<p className="display-font mt-1 font-bold text-2xl leading-tight">
							{ticket.id}
						</p>
					</div>

					<div className="grid grid-cols-2 gap-0 border-[#e4e9f8] border-b bg-[#fcfdff] text-sm">
						<Stat label="Event" value={ticket.eventId} />
						<Stat label="Tier" value={ticket.tierId} />
						<Stat label="Order" value={ticket.orderId} />
						<Stat label="Price paid" value={new Intl.NumberFormat("en", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(ticket.pricePaid)} />
						<Stat label="Created" value={formatDateTime(ticket.createdAt)} />
						<Stat label="Updated" value={formatDateTime(ticket.updatedAt)} />
					</div>

					<div className="space-y-4 bg-[#f7faff] px-4 py-5 text-center">
						<p className="font-semibold text-[#20294a]">Scan to enter</p>
						<div className="mx-auto max-w-[220px] rounded-xl border border-[#d9e2f8] bg-white p-3">
							<Image
								src="/assets/iphone.webp"
								alt="Ticket QR sample"
								width={220}
								height={360}
								className="h-auto w-full rounded-lg"
							/>
						</div>

						<div className="space-y-1">
							<p className="font-bold text-[#1a2442]">{ticket.id}</p>
							<p className="text-[#6b7491] text-sm">
								Event ID: {ticket.eventId}
							</p>
							<p className="text-[#6b7491] text-xs">
								Ticket: {ticket.id} - Issued {formatDateTime(ticket.createdAt)}
							</p>
						</div>

						<span className="inline-flex rounded-full bg-[#c8f0de] px-4 py-1.5 font-bold text-[#13794f] text-sm">
							{ticket.tierId}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="border-[#e4e9f8] border-r border-b p-3 text-left odd:border-r even:border-r-0">
			<p className="font-semibold text-[#8a93af] text-[10px] uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-1 font-semibold text-[#1e2747] text-sm">{value}</p>
		</div>
	);
}
