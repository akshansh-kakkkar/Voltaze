"use client";

import { buttonVariants } from "@voltaze/ui/components/button";
import { Skeleton } from "@voltaze/ui/components/skeleton";
import { cn } from "@voltaze/ui/lib/utils";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEventBySlug, useTicketTiers } from "@/lib/api/hooks";
import { useCart } from "@/lib/cart-context";

export default function EventDetailsPage({
	params,
}: {
	params: { slug: string };
}) {
	const router = useRouter();
	const { items: cartItems, addItem, updateQuantity } = useCart();

	const {
		data: event,
		isLoading: eventLoading,
		error: eventError,
	} = useEventBySlug(params.slug);
	const { data: tiers, isLoading: tiersLoading } = useTicketTiers(
		event?.id || "",
	);

	const handleAddToCart = (tierId: string, tierName: string, price: number) => {
		if (!event) return;
		addItem({
			tierId,
			tierName,
			price,
			quantity: 1,
			eventId: event.id,
			eventSlug: event.slug,
		});
	};

	const handleCheckout = () => {
		if (!event) return;
		router.push(`/checkout?event=${event.slug}`);
	};

	const eventCart = event
		? cartItems.filter((i) => i.eventId === event.id)
		: [];
	const cartTotal = eventCart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	if (eventError) {
		return (
			<main className="bg-muted px-6 py-24 md:px-10">
				<div className="mx-auto max-w-2xl bg-card px-10 py-16 text-center">
					<p className="label-sm mb-4 text-destructive">Error</p>
					<h1 className="headline-lg mb-4">Event not found</h1>
					<p className="body-md text-muted-foreground">{eventError.message}</p>
				</div>
			</main>
		);
	}

	return (
		<main className="bg-background">
			{eventLoading ? (
				<div className="animate-pulse">
					<Skeleton className="aspect-[21/9] w-full max-md:aspect-video" />
					<div className="mx-auto grid max-w-[100rem] gap-12 px-6 py-12 md:grid-cols-12 md:px-10 md:py-16">
						<div className="space-y-6 md:col-span-7">
							<Skeleton className="h-12 w-3/4" />
							<Skeleton className="h-32 w-full" />
						</div>
						<div className="md:col-span-5">
							<Skeleton className="h-80 w-full" />
						</div>
					</div>
				</div>
			) : event ? (
				<>
					<div className="relative aspect-[21/9] max-h-[70vh] min-h-[280px] w-full bg-muted max-md:aspect-video">
						{event.coverUrl ? (
							<Image
								src={event.coverUrl}
								alt=""
								className="absolute inset-0 h-full w-full object-cover"
								fill
								sizes="100vw"
							/>
						) : null}
						<div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
					</div>

					<div className="mx-auto max-w-[100rem] px-6 py-12 md:px-10 md:py-20">
						<div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
							<div className="space-y-12 lg:col-span-7">
								<div>
									<span className="mb-4 inline-block bg-primary px-3 py-1.5 font-semibold text-[0.65rem] text-primary-foreground uppercase tracking-[0.2em]">
										{event.status}
									</span>
									<h1 className="display-lg mt-6 max-w-[20ch]">
										{event.title}
									</h1>
								</div>

								<div className="grid gap-8 sm:grid-cols-2">
									<div className="bg-muted px-6 py-8">
										<p className="label-sm mb-2">When</p>
										<p className="font-heading font-medium text-lg">
											{new Date(event.startsAt).toLocaleString(undefined, {
												weekday: "short",
												month: "short",
												day: "numeric",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
									<div className="bg-muted px-6 py-8">
										<p className="label-sm mb-2">Where</p>
										<p className="font-heading font-medium text-lg">
											{event.venueName || "TBA"}
										</p>
										<p className="body-md mt-1 text-muted-foreground">
											{[event.address, event.city].filter(Boolean).join(", ") ||
												""}
										</p>
									</div>
								</div>

								<div>
									<h2 className="headline-lg mb-6">About</h2>
									<p className="body-md max-w-prose text-muted-foreground">
										{event.description || "Details coming soon."}
									</p>
								</div>
							</div>

							<div className="lg:col-span-5">
								<div className="glow-float bg-card lg:sticky lg:top-28">
									<div className="bg-secondary px-8 py-6">
										<p className="label-sm">Tickets</p>
									</div>
									<div className="space-y-6 p-8">
										{tiersLoading ? (
											<div className="space-y-4">
												<Skeleton className="h-24 w-full" />
												<Skeleton className="h-24 w-full" />
											</div>
										) : tiers && tiers.length > 0 ? (
											tiers.map((tier) => {
												const available = tier.quantity
													? tier.quantity - tier.sold
													: Number.POSITIVE_INFINITY;
												const inCart = eventCart.find(
													(item) => item.tierId === tier.id,
												);

												return (
													<div
														key={tier.id}
														className={cn(
															"bg-muted px-6 py-6 transition-colors",
															inCart && "bg-secondary",
														)}
													>
														<div className="mb-4 flex justify-between gap-4">
															<div>
																<p className="font-heading font-semibold text-lg">
																	{tier.name}
																</p>
																{tier.description && (
																	<p className="body-md mt-1 text-muted-foreground">
																		{tier.description}
																	</p>
																)}
															</div>
															<p className="font-bold font-heading text-xl tabular-nums">
																₹{tier.price.toLocaleString()}
															</p>
														</div>
														<div className="flex items-center justify-between">
															<p className="text-muted-foreground text-xs uppercase tracking-widest">
																{available === Number.POSITIVE_INFINITY
																	? "Available"
																	: available > 0
																		? `${available} left`
																		: "Sold out"}
															</p>
															{available !== 0 &&
																(inCart ? (
																	<div className="flex items-center gap-3 bg-card px-2 py-1">
																		<button
																			type="button"
																			className="flex h-9 w-9 items-center justify-center bg-muted text-lg hover:bg-secondary"
																			onClick={() =>
																				updateQuantity(
																					tier.id,
																					inCart.quantity - 1,
																				)
																			}
																		>
																			<Minus className="h-4 w-4" />
																		</button>
																		<span className="min-w-[2ch] text-center font-semibold text-sm">
																			{inCart.quantity}
																		</span>
																		<button
																			type="button"
																			className="flex h-9 w-9 items-center justify-center bg-muted text-lg hover:bg-secondary"
																			onClick={() =>
																				updateQuantity(
																					tier.id,
																					inCart.quantity + 1,
																				)
																			}
																			disabled={inCart.quantity >= available}
																		>
																			<Plus className="h-4 w-4" />
																		</button>
																	</div>
																) : (
																	<button
																		type="button"
																		className={cn(
																			buttonVariants({ size: "sm" }),
																		)}
																		onClick={() =>
																			handleAddToCart(
																				tier.id,
																				tier.name,
																				tier.price,
																			)
																		}
																	>
																		Add
																	</button>
																))}
														</div>
													</div>
												);
											})
										) : (
											<p className="body-md text-muted-foreground">
												No ticket tiers yet.
											</p>
										)}

										{eventCart.length > 0 && (
											<div className="space-y-6 pt-4">
												<div className="flex items-end justify-between">
													<span className="label-sm text-muted-foreground">
														Subtotal
													</span>
													<span className="font-bold font-heading text-3xl">
														₹{cartTotal.toLocaleString()}
													</span>
												</div>
												<button
													type="button"
													className={cn(
														buttonVariants({ size: "lg" }),
														"gradient-cta w-full border-0",
													)}
													onClick={handleCheckout}
												>
													Checkout
												</button>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			) : null}
		</main>
	);
}
