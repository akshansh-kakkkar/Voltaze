"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth";
import { useEvent, useTicketTiers } from "@/features/events/hooks/use-events";
import { CheckoutSummary } from "@/features/payments/components/checkout-summary";
import {
	type CheckoutDraftItem,
	type CheckoutDraftTicketHolder,
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
	}).format(amount);
}

export function CheckoutAttendeePage({ slug }: { slug: string }) {
	const router = useRouter();
	const { data: user } = useCurrentUser();
	const { data: event, isLoading: isEventLoading } = useEvent(slug);
	const { data: tiersResponse } = useTicketTiers(event?.id ?? "");

	const [purchaserName, setPurchaserName] = useState("");
	const [purchaserEmail, setPurchaserEmail] = useState("");
	const [purchaserPhone, setPurchaserPhone] = useState("");
	const [tierQuantities, setTierQuantities] = useState<Record<string, number>>(
		{},
	);
	const [ticketHolders, setTicketHolders] = useState<
		CheckoutDraftTicketHolder[]
	>([]);

	const paidTiers = useMemo(
		() =>
			(tiersResponse?.data ?? [])
				.filter((tier) => tier.price > 0 && tier.soldCount < tier.maxQuantity)
				.sort((a, b) => a.price - b.price),
		[tiersResponse?.data],
	);

	const selectedItems = useMemo<CheckoutDraftItem[]>(
		() =>
			paidTiers
				.map((tier) => ({
					tierId: tier.id,
					quantity: tierQuantities[tier.id] ?? 0,
				}))
				.filter((item) => item.quantity > 0),
		[paidTiers, tierQuantities],
	);

	const selectedTiers = useMemo(
		() =>
			selectedItems
				.map((item) => {
					const tier = paidTiers.find((value) => value.id === item.tierId);
					if (!tier) {
						return null;
					}

					return {
						id: tier.id,
						name: tier.name,
						price: tier.price,
						quantity: item.quantity,
					};
				})
				.filter((value): value is NonNullable<typeof value> => Boolean(value)),
		[selectedItems, paidTiers],
	);

	const totalTickets = useMemo(
		() => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
		[selectedItems],
	);

	useEffect(() => {
		if (!user) {
			const redirectTo = encodeURIComponent(`/events/${slug}/checkout`);
			startTopLoader();
			router.replace(`/login?redirect=${redirectTo}`);
			return;
		}

		setPurchaserName((current) => current || user.name?.trim() || "");
		setPurchaserEmail((current) => current || user.email || "");
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
			setPurchaserName((current) => current || draft.purchaserName);
			setPurchaserEmail((current) => current || draft.purchaserEmail);
			setPurchaserPhone((current) => current || draft.purchaserPhone);

			setTierQuantities(() =>
				draft.items.reduce<Record<string, number>>((acc, item) => {
					acc[item.tierId] = item.quantity;
					return acc;
				}, {}),
			);

			setTicketHolders(draft.ticketHolders);
		}
	}, [event, router]);

	useEffect(() => {
		if (paidTiers.length === 0) {
			return;
		}

		setTierQuantities((current) => {
			const next: Record<string, number> = {};
			for (const tier of paidTiers) {
				next[tier.id] = Math.max(0, current[tier.id] ?? 0);
			}

			return next;
		});
	}, [paidTiers]);

	useEffect(() => {
		const holderSlots: string[] = [];
		for (const tier of paidTiers) {
			const quantity = tierQuantities[tier.id] ?? 0;
			for (let index = 0; index < quantity; index++) {
				holderSlots.push(`${tier.id}:${index}`);
			}
		}

		if (holderSlots.length === 0) {
			setTicketHolders([]);
			return;
		}

		setTicketHolders((current) => {
			const keyedCurrent = new Map(
				current.map((holder, index) => {
					const key = `${holder.tierId}:${index}`;
					return [key, holder];
				}),
			);

			return holderSlots.map((slot) => {
				const [tierId] = slot.split(":");
				return (
					keyedCurrent.get(slot) ?? {
						tierId,
						name: purchaserName.trim(),
						email: purchaserEmail.trim(),
						phone: purchaserPhone.trim(),
					}
				);
			});
		});
	}, [
		paidTiers,
		purchaserEmail,
		purchaserName,
		purchaserPhone,
		tierQuantities,
	]);

	const updateTierQuantity = (tierId: string, quantity: number) => {
		setTierQuantities((current) => ({
			...current,
			[tierId]: Math.max(0, quantity),
		}));
	};

	const updateTicketHolder = (
		index: number,
		field: "name" | "email" | "phone",
		value: string,
	) => {
		setTicketHolders((current) => {
			const next = [...current];
			next[index] = {
				...next[index],
				[field]: value,
			};
			return next;
		});
	};

	const handleContinue = () => {
		if (!event || selectedItems.length === 0) {
			showNotification({
				title: "Select a ticket",
				message: "Please select at least one ticket tier and quantity.",
				color: "red",
			});
			return;
		}

		if (!purchaserName.trim() || !purchaserEmail.trim()) {
			showNotification({
				title: "Missing attendee details",
				message: "Purchaser name and email are required.",
				color: "red",
			});
			return;
		}

		const hasInvalidHolder = ticketHolders.some(
			(holder) => !holder.name.trim() || !holder.email.trim(),
		);

		if (hasInvalidHolder) {
			showNotification({
				title: "Missing ticket holder details",
				message: "Each ticket holder must have a name and email.",
				color: "red",
			});
			return;
		}

		writeCheckoutDraft({
			eventId: event.id,
			eventSlug: event.slug,
			items: selectedItems,
			purchaserName: purchaserName.trim(),
			purchaserEmail: purchaserEmail.trim(),
			purchaserPhone: purchaserPhone.trim(),
			ticketHolders: ticketHolders.map((holder) => ({
				tierId: holder.tierId,
				name: holder.name.trim(),
				email: holder.email.trim(),
				phone: holder.phone.trim(),
			})),
		});

		startTopLoader();
		router.push(`/events/${event.slug}/checkout/payment` as Route);
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
			<div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-8 px-6 pb-12 lg:grid-cols-[minmax(0,1fr)_320px]">
				<section className="rounded-2xl bg-[#e8eefc] p-8 shadow-sm">
					<h1 className="font-bold text-4xl text-[#0f172a]">
						Attendee Information
					</h1>
					<p className="mt-2 text-[#64748b] text-sm">
						Select ticket tiers, quantity, and fill details for each ticket
						holder.
					</p>

					<div className="mt-7 space-y-4">
						<div>
							<label
								htmlFor="purchaser-name"
								className="mb-2 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide"
							>
								Purchaser Full Name
							</label>
							<Input
								id="purchaser-name"
								value={purchaserName}
								onChange={(e) => setPurchaserName(e.target.value)}
								placeholder="John Doe"
								className="h-11 border-0 bg-white"
							/>
						</div>
						<div>
							<label
								htmlFor="purchaser-email"
								className="mb-2 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide"
							>
								Purchaser Email Address
							</label>
							<Input
								id="purchaser-email"
								value={purchaserEmail}
								onChange={(e) => setPurchaserEmail(e.target.value)}
								placeholder="john@email.com"
								className="h-11 border-0 bg-white"
							/>
						</div>
						<div>
							<label
								htmlFor="purchaser-phone"
								className="mb-2 block font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide"
							>
								Purchaser Whatsapp Number
							</label>
							<Input
								id="purchaser-phone"
								value={purchaserPhone}
								onChange={(e) => setPurchaserPhone(e.target.value)}
								placeholder="0000 0000 000"
								className="h-11 border-0 bg-white"
							/>
						</div>
					</div>

					<p className="mt-6 text-[#64748b] text-xs">
						Your digital ticket and QR code will be sent on your email and
						Whatsapp.
					</p>

					<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
						{paidTiers.map((tier) => {
							const quantity = tierQuantities[tier.id] ?? 0;
							const remaining = tier.maxQuantity - tier.soldCount;
							return (
								<div
									key={tier.id}
									className="rounded-xl border border-transparent bg-white/70 p-4 text-left"
								>
									<p className="font-semibold text-slate-900 text-sm">
										{tier.name}
									</p>
									<p className="font-bold text-[#2563eb] text-sm">
										{formatMoney(tier.price)}
									</p>
									<p className="mt-1 text-slate-500 text-xs">
										{remaining} seats left
									</p>
									<div className="mt-3 flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											className="h-8 w-8 rounded-full p-0"
											onClick={() =>
												updateTierQuantity(tier.id, Math.max(0, quantity - 1))
											}
										>
											-
										</Button>
										<Input
											type="number"
											min={0}
											max={remaining}
											value={quantity}
											onChange={(e) =>
												updateTierQuantity(
													tier.id,
													Math.min(remaining, Number(e.target.value) || 0),
												)
											}
											className="h-8 w-20 border-0 bg-white text-center"
										/>
										<Button
											type="button"
											variant="outline"
											className="h-8 w-8 rounded-full p-0"
											onClick={() =>
												updateTierQuantity(
													tier.id,
													Math.min(remaining, quantity + 1),
												)
											}
										>
											+
										</Button>
									</div>
								</div>
							);
						})}
					</div>

					{totalTickets > 0 && (
						<div className="mt-6 space-y-4">
							<h2 className="font-semibold text-[#0f172a] text-lg">
								Ticket Holder Details ({totalTickets})
							</h2>
							{ticketHolders.map((holder, index) => {
								const tierName =
									paidTiers.find((tier) => tier.id === holder.tierId)?.name ??
									"Ticket";

								return (
									<div
										key={`${holder.tierId}-${index}`}
										className="rounded-xl border border-slate-200 bg-white p-4"
									>
										<p className="font-semibold text-slate-900 text-sm">
											Ticket {index + 1} - {tierName}
										</p>
										<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
											<Input
												value={holder.name}
												onChange={(e) =>
													updateTicketHolder(index, "name", e.target.value)
												}
												placeholder="Holder name"
												className="h-10 border border-slate-200 bg-white"
											/>
											<Input
												value={holder.email}
												onChange={(e) =>
													updateTicketHolder(index, "email", e.target.value)
												}
												placeholder="Holder email"
												className="h-10 border border-slate-200 bg-white"
											/>
											<Input
												value={holder.phone}
												onChange={(e) =>
													updateTicketHolder(index, "phone", e.target.value)
												}
												placeholder="Holder phone (optional)"
												className="h-10 border border-slate-200 bg-white"
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}

					<Button
						onClick={handleContinue}
						className="mt-7 h-12 w-full rounded-full bg-[#070190] font-semibold text-base text-white hover:bg-[#030370]"
					>
						Continue To Pay
					</Button>
				</section>

				<CheckoutSummary event={event} selectedTiers={selectedTiers} />
			</div>
		</div>
	);
}
