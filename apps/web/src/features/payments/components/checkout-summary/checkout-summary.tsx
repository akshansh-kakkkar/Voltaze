import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type CheckoutSummaryEvent = {
	startDate: string | Date;
	venueName: string;
};

type CheckoutSummaryTier = {
	id: string;
	name: string;
	price: number;
	quantity: number;
};

export interface CheckoutSummaryProps {
	event: CheckoutSummaryEvent;
	selectedTiers: CheckoutSummaryTier[];
	className?: string;
	currency?: string;
}

function formatMoney(amount: number, currency: string) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}

export function CheckoutSummary({
	event,
	selectedTiers,
	className,
	currency = "INR",
}: CheckoutSummaryProps) {
	const totalAmount = selectedTiers.reduce(
		(total, tier) => total + tier.price * tier.quantity,
		0,
	);

	const totalTickets = selectedTiers.reduce(
		(total, tier) => total + tier.quantity,
		0,
	);

	return (
		<aside className={cn("rounded-2xl bg-[#e8eefc] p-6 shadow-sm", className)}>
			<div className="space-y-3 text-[#0f172a] text-xs">
				<div className="flex items-start gap-2">
					<CalendarDays className="mt-0.5 h-4 w-4 text-[#4f46e5]" />
					<div>
						<p className="font-semibold text-[#1d4ed8] uppercase tracking-wide">
							Date & Time
						</p>
						<p>{new Date(event.startDate).toLocaleString()}</p>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<MapPin className="mt-0.5 h-4 w-4 text-[#4f46e5]" />
					<div>
						<p className="font-semibold text-[#1d4ed8] uppercase tracking-wide">
							Location
						</p>
						<p>{event.venueName}</p>
					</div>
				</div>
			</div>

			<div className="mt-6 border-slate-300 border-t pt-4 text-sm">
				<p className="text-slate-600">Selected Tickets</p>
				{selectedTiers.length === 0 ? (
					<p className="mt-1 text-slate-700">-</p>
				) : (
					<ul className="mt-2 space-y-2">
						{selectedTiers.map((tier) => (
							<li key={tier.id} className="flex items-center justify-between">
								<div>
									<p className="font-semibold text-slate-900">{tier.name}</p>
									<p className="text-slate-600 text-xs">Qty: {tier.quantity}</p>
								</div>
								<p className="text-slate-700 text-xs">
									{formatMoney(tier.price * tier.quantity, currency)}
								</p>
							</li>
						))}
					</ul>
				)}
				<div className="mt-4 flex items-center justify-between border-slate-300 border-t pt-3">
					<span className="font-semibold text-slate-700">
						Total Amount ({totalTickets} tickets)
					</span>
					<span className="font-bold text-[#070190] text-lg">
						{selectedTiers.length > 0
							? formatMoney(totalAmount, currency)
							: "-"}
					</span>
				</div>
				<p className="mt-2 text-[11px] text-slate-500">Taxes included</p>
			</div>

			<div className="mt-6 flex items-center gap-2 text-[#0f766e] text-xs">
				<CheckCircle2 className="h-4 w-4" />
				<span>Secure checkout powered by Razorpay</span>
			</div>
		</aside>
	);
}
