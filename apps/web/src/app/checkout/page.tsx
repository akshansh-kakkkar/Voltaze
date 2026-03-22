"use client";

import { Button } from "@voltaze/ui/components/button";
import { Input } from "@voltaze/ui/components/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { usePurchaseTickets } from "@/lib/api/hooks";
import { authClient } from "@/lib/auth/client";
import { useCart } from "@/lib/cart-context";

interface RazorpayWindow extends Window {
	Razorpay: new (options: Record<string, unknown>) => { open: () => void };
}

function CheckoutContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventSlug = searchParams.get("event");
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const { items: cartItems, total, clear } = useCart();

	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [promoCode, setPromoCode] = useState("");
	const [discount] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	const { mutate: purchaseTickets } = usePurchaseTickets();

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, []);

	useEffect(() => {
		if (session?.user?.email) setEmail(session.user.email);
		const name = session?.user?.name;
		if (name) {
			const parts = name.trim().split(/\s+/);
			setFirstName(parts[0] ?? "");
			setLastName(parts.slice(1).join(" ") ?? "");
		}
	}, [session?.user]);

	useEffect(() => {
		if (!sessionPending && !session?.user) {
			toast.error("Sign in to complete checkout");
			router.replace(
				`/login?redirect=${encodeURIComponent(`/checkout?event=${eventSlug || ""}`)}`,
			);
		}
	}, [session, sessionPending, router, eventSlug]);

	useEffect(() => {
		if (!sessionPending && session?.user && !cartItems.length) {
			toast.error("Your cart is empty");
			router.replace(eventSlug ? `/events/${eventSlug}` : "/events");
		}
	}, [cartItems.length, router, eventSlug, session, sessionPending]);

	const handleApplyPromo = () => {
		toast.info("Promo is applied on the server when you pay");
	};

	const handleCheckout = async () => {
		if (!session?.user) return;
		const firstCartItem = cartItems.at(0);
		if (!firstCartItem) {
			toast.error("Your cart is empty");
			return;
		}

		if (!email || !phone || !firstName || !lastName) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (phone.replace(/\D/g, "").length < 10) {
			toast.error("Please enter a valid phone number");
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		setIsProcessing(true);

		try {
			const result = await purchaseTickets({
				eventId: firstCartItem.eventId,
				items: cartItems.map((item) => ({
					tierId: item.tierId,
					quantity: item.quantity,
				})),
				promoCode: promoCode || undefined,
			});

			if (!result) throw new Error("Failed to create order");

			if (!result.paymentRequired) {
				setIsProcessing(false);
				toast.success("You're registered!");
				clear();
				router.push(`/order/${result.primaryTicket.id}?free=1`);
				return;
			}

			const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
			if (!key) throw new Error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID");

			const amountPaise = result.amountPaise ?? 0;
			const rzpWindow = window as unknown as RazorpayWindow;

			const options = {
				key,
				order_id: result.razorpayOrderId,
				amount: amountPaise,
				currency: result.currency || "INR",
				name: "Voltaze",
				description: `Tickets — ${firstCartItem.eventSlug}`,
				prefill: {
					name: `${firstName} ${lastName}`,
					email,
					contact: phone.replace(/\D/g, ""),
				},
				handler: () => {
					setIsProcessing(false);
					toast.success("Payment successful!");
					clear();
					router.push(`/order/${result.primaryTicket.id}`);
				},
				modal: {
					ondismiss: () => {
						setIsProcessing(false);
						toast.info("Payment cancelled");
					},
				},
			};

			new rzpWindow.Razorpay(options).open();
		} catch (error) {
			setIsProcessing(false);
			const message =
				error instanceof Error ? error.message : "Checkout failed";
			toast.error(message);
			console.error("Checkout error:", error);
		}
	};

	const loadingBlock = (
		<main className="flex min-h-[60vh] items-center justify-center bg-muted">
			<div className="h-2 w-32 animate-pulse bg-primary" />
		</main>
	);

	if (sessionPending || !session?.user) return loadingBlock;
	if (!cartItems.length) return loadingBlock;

	const finalTotal = total - discount;

	return (
		<main className="bg-background">
			<div className="bg-muted px-6 py-14 md:px-10 md:py-20">
				<div className="mx-auto max-w-[100rem]">
					<p className="label-sm mb-4">Checkout</p>
					<h1 className="display-lg max-w-[18ch]">Register &amp; pay</h1>
					<p className="body-md mt-6 max-w-xl text-muted-foreground">
						INR totals. Razorpay handles the payment step.
					</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-[100rem] gap-12 px-6 py-12 md:grid-cols-12 md:gap-16 md:px-10 md:py-16">
				<div className="space-y-12 md:col-span-7">
					<section className="bg-card p-8 md:p-10">
						<h2 className="headline-lg mb-10">Attendee</h2>
						<div className="grid gap-8 sm:grid-cols-2">
							<div>
								<label className="label-sm mb-3 block" htmlFor="fn">
									First name
								</label>
								<Input
									id="fn"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									disabled={isProcessing}
								/>
							</div>
							<div>
								<label className="label-sm mb-3 block" htmlFor="ln">
									Last name
								</label>
								<Input
									id="ln"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									disabled={isProcessing}
								/>
							</div>
							<div className="sm:col-span-2">
								<label className="label-sm mb-3 block" htmlFor="em">
									Email
								</label>
								<Input
									id="em"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isProcessing}
								/>
							</div>
							<div className="sm:col-span-2">
								<label className="label-sm mb-3 block" htmlFor="ph">
									Phone (+91)
								</label>
								<Input
									id="ph"
									type="tel"
									value={phone}
									onChange={(e) =>
										setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
									}
									disabled={isProcessing}
									maxLength={10}
								/>
							</div>
						</div>
					</section>

					<section className="bg-card p-8 md:p-10">
						<h2 className="headline-lg mb-8">Promo</h2>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
							<div className="min-w-0 flex-1">
								<label className="label-sm mb-3 block" htmlFor="promo">
									Code
								</label>
								<Input
									id="promo"
									value={promoCode}
									onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
									disabled={isProcessing}
								/>
							</div>
							<Button
								type="button"
								variant="secondary"
								onClick={handleApplyPromo}
								disabled={!promoCode || isProcessing}
							>
								How it works
							</Button>
						</div>
					</section>
				</div>

				<div className="md:col-span-5">
					<div className="glow-float bg-muted md:sticky md:top-28">
						<div className="bg-secondary px-8 py-5">
							<p className="label-sm">Summary</p>
						</div>
						<div className="space-y-8 p-8">
							<ul className="space-y-8">
								{cartItems.map((item, idx) => (
									<li
										key={`${item.tierId}-${idx}`}
										className="flex justify-between gap-6"
									>
										<div>
											<p className="font-heading font-semibold">
												{item.tierName}
											</p>
											<p className="body-md text-muted-foreground">
												{item.quantity} × ₹{item.price.toLocaleString()}
											</p>
										</div>
										<p className="font-heading font-semibold tabular-nums">
											₹{(item.price * item.quantity).toLocaleString()}
										</p>
									</li>
								))}
							</ul>

							<div className="space-y-4 pt-4">
								<div className="body-md flex justify-between text-muted-foreground">
									<span>Subtotal</span>
									<span className="font-medium text-foreground">
										₹{total.toLocaleString()}
									</span>
								</div>
								{discount > 0 && (
									<div className="flex justify-between text-green-700 text-sm">
										<span>Discount</span>
										<span>-₹{discount.toLocaleString()}</span>
									</div>
								)}
							</div>

							<div className="flex items-baseline justify-between pt-6">
								<span className="label-sm text-muted-foreground">Total</span>
								<span className="font-bold font-heading text-4xl tabular-nums">
									₹{finalTotal.toLocaleString()}
								</span>
							</div>

							<Button
								className="gradient-cta w-full border-0"
								size="lg"
								onClick={handleCheckout}
								disabled={isProcessing || !email || !phone}
							>
								{isProcessing ? "Processing…" : "Pay with Razorpay"}
							</Button>

							<p className="text-center text-muted-foreground text-xs">
								Secured by Razorpay
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

export default function CheckoutPage() {
	return (
		<Suspense
			fallback={
				<main className="flex min-h-[60vh] items-center justify-center bg-muted">
					<div className="h-2 w-32 animate-pulse bg-primary" />
				</main>
			}
		>
			<CheckoutContent />
		</Suspense>
	);
}
