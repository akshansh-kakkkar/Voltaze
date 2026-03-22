"use client";

import { buttonVariants } from "@voltaze/ui/components/button";
import { cn } from "@voltaze/ui/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderInner({ orderId }: { orderId: string }) {
	const searchParams = useSearchParams();
	const paymentId = searchParams.get("paymentId");
	const free = searchParams.get("free");

	return (
		<main className="bg-background">
			<div className="bg-primary px-6 py-20 text-primary-foreground md:px-10 md:py-28">
				<div className="mx-auto max-w-[100rem]">
					<p className="label-sm mb-6 text-primary-foreground/90">
						{free ? "Confirmed" : "Payment"}
					</p>
					<h1 className="display-lg max-w-[20ch] text-primary-foreground">
						{free ? "You are in." : "Thank you."}
					</h1>
					<p className="body-md mt-8 max-w-xl text-primary-foreground/85">
						{free
							? "Your free registration is saved."
							: "If Razorpay reported success, your tickets are issued."}
					</p>
				</div>
			</div>

			<div className="mx-auto max-w-[100rem] px-6 py-12 md:px-10 md:py-16">
				<div className="glow-float max-w-xl bg-card p-10">
					<p className="label-sm mb-2">Reference</p>
					<p className="break-all font-mono text-foreground text-sm">
						{orderId}
					</p>
					{paymentId && (
						<>
							<p className="label-sm mt-8 mb-2">Payment</p>
							<p className="break-all font-mono text-sm">{paymentId}</p>
						</>
					)}
					<div className="mt-12 flex flex-col gap-4 sm:flex-row">
						<Link
							href="/tickets"
							className={cn(buttonVariants({ size: "lg" }))}
						>
							My tickets
						</Link>
						<Link
							href="/events"
							className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
						>
							More events
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}

export default function OrderSuccessPage({
	params,
}: {
	params: { orderId: string };
}) {
	return (
		<Suspense
			fallback={
				<main className="flex min-h-[40vh] items-center justify-center bg-muted">
					<div className="h-2 w-32 animate-pulse bg-primary" />
				</main>
			}
		>
			<OrderInner orderId={params.orderId} />
		</Suspense>
	);
}
