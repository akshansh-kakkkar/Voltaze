"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth";
import { useEvent, useTicketTiers } from "@/features/events/hooks/use-events";
import { CheckoutSummary } from "@/features/payments/components/checkout-summary";
import {
	readCheckoutDraft,
	writeCheckoutDraft,
} from "@/features/payments/utils/checkout-session";
import { showNotification } from "@/shared/lib/notifications";
import { startTopLoader } from "@/shared/lib/top-loader-events";
import { Navbar } from "@/shared/ui/navbar";

function formatMoney(amount: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount / 100);
}

export function CheckoutAttendeePage({ slug }: { slug: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: user } = useCurrentUser();
	const { data: event, isLoading: isEventLoading } = useEvent(slug);
	const { data: tiersResponse } = useTicketTiers(event?.id ?? "");

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

	const paidTiers = useMemo(
		() =>
			(tiersResponse?.data ?? [])
				.filter((tier) => tier.price > 0 && tier.soldCount < tier.maxQuantity)
				.sort((a, b) => a.price - b.price),
		[tiersResponse?.data],
	);

	const selectedTier =
		paidTiers.find((tier) => tier.id === selectedTierId) ??
		paidTiers[0] ??
		null;

	useEffect(() => {
		if (!user) {
			const redirectTo = encodeURIComponent(`/events/${slug}/checkout`);
			startTopLoader();
			router.replace(`/login?redirect=${redirectTo}`);
			return;
		}

		setName((current) => current || user.name?.trim() || "");
		setEmail((current) => current || user.email || "");
	}, [router, slug, user]);

	useEffect(() => {
		if (!event) {
			return;
		}

		if (event.type !== "PAID") {
			showNotification({
				title: "Free event",
				message: "This event does not require checkout.",
				color: "blue",
			});
			startTopLoader();
			router.replace(`/events/${event.slug}` as Route);
			return;
		}

		const draft = readCheckoutDraft(event.slug);
		if (draft) {
			setName((current) => current || draft.name);
			setEmail((current) => current || draft.email);
			setPhone((current) => current || draft.phone);
		}
	}, [event, router]);

	useEffect(() => {
		const requestedTierId = searchParams.get("tierId");
		const draftTierId = readCheckoutDraft(slug)?.tierId;
		const targetTierId =
			requestedTierId || draftTierId || paidTiers[0]?.id || null;

		if (targetTierId) {
			setSelectedTierId(targetTierId);
		}
	}, [paidTiers, searchParams, slug]);

	const handleContinue = () => {
		if (!event || !selectedTier) {
			showNotification({
				title: "Select a ticket",
				message: "Please select an available paid ticket tier.",
				color: "red",
			});
			return;
		}

		if (!name.trim() || !email.trim()) {
			showNotification({
				title: "Missing attendee details",
				message: "Name and email are required.",
				color: "red",
			});
			return;
		}

		writeCheckoutDraft({
			eventId: event.id,
			eventSlug: event.slug,
			tierId: selectedTier.id,
			quantity: 1,
			name: name.trim(),
			email: email.trim(),
			phone: phone.trim(),
		});

		startTopLoader();
		router.push(
			`/events/${event.slug}/checkout/payment?tierId=${selectedTier.id}` as Route,
		);
	};

	if (isEventLoading || !event) {
		return (
			<div className="min-h-screen bg-[#f7f8fb]">
				<Navbar />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f8fb]">
			<Navbar />
			<div className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 px-3 pb-8 sm:mt-10 sm:gap-7 sm:px-4 sm:pb-10 md:mt-12 md:gap-8 md:px-6 md:pb-12 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 xl:gap-10">
				<section className="rounded-xl bg-[#e8eefc] p-4 shadow-sm sm:rounded-2xl sm:p-6 md:p-8">
					<h1 className="font-bold text-2xl text-[#0f172a] sm:text-3xl md:text-4xl lg:text-4xl">
						Attendee Information
					</h1>
					<p className="mt-1 text-[#64748b] text-xs sm:mt-2 sm:text-sm">
						Tell us who is joining the experience. This information will appear
						on your digital tickets.
					</p>

					<div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4 md:mt-7">
						<div>
							<label
								htmlFor="attendee-name"
								className="mb-1.5 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide sm:mb-2"
							>
								Full Name
							</label>
							<Input
								id="attendee-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="John Doe"
								className="h-9 border-0 bg-white text-sm sm:h-10 md:h-11"
							/>
						</div>
						<div>
							<label
								htmlFor="attendee-email"
								className="mb-1.5 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide sm:mb-2"
							>
								Email Address
							</label>
							<Input
								id="attendee-email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="john@email.com"
								className="h-9 border-0 bg-white text-sm sm:h-10 md:h-11"
							/>
						</div>
						<div>
							<label
								htmlFor="attendee-phone"
								className="mb-1.5 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide sm:mb-2"
							>
								Whatsapp Number
							</label>
							<Input
								id="attendee-phone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="0000 0000 000"
								className="h-9 border-0 bg-white text-sm sm:h-10 md:h-11"
							/>
						</div>
					</div>

					<p className="mt-4 text-[#64748b] text-xs sm:mt-5 md:mt-6">
						Your digital ticket and QR code will be sent on your email and
						Whatsapp.
					</p>

					<div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-2.5 md:mt-4 md:gap-3">
						{paidTiers.map((tier, index) => {
							const isSelected = selectedTier?.id === tier.id;
							return (
								<button
									type="button"
									key={tier.id}
									onClick={() => setSelectedTierId(tier.id)}
									className={`rounded-lg border p-3 text-left transition sm:rounded-xl sm:p-3.5 md:p-4 ${
										isSelected
											? "border-[#1d4ed8] bg-white"
											: "border-transparent bg-white/70"
									}`}
								>
									{index === 0 && (
										<span className="mb-1 inline-flex rounded-full bg-[#dbeafe] px-2 py-0.5 font-semibold text-[#1d4ed8] text-[10px] uppercase">
											Best Value
										</span>
									)}
									<p className="font-semibold text-slate-900 text-xs sm:text-sm">
										{tier.name}
									</p>
									<p className="font-bold text-[#2563eb] text-xs sm:text-sm">
										{formatMoney(tier.price)}
									</p>
								</button>
							);
						})}
					</div>

					<Button
						onClick={handleContinue}
						className="mt-5 h-10 w-full rounded-full bg-[#070190] font-semibold text-sm text-white hover:bg-[#030370] sm:mt-6 sm:h-11 sm:text-base md:mt-7 md:h-12"
					>
						Continue To Pay
					</Button>
				</section>

				<CheckoutSummary event={event} selectedTier={selectedTier} />
			</div>
		</div>
	);
}
