import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar";

export default function RefundPolicyPage() {
	return (
		<div className="flex min-h-screen flex-col bg-[#EBF3FF]">
			<Navbar />
			<main className="flex-1 px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
				<div className="mx-auto max-w-4xl rounded-xl bg-white p-5 shadow-lg sm:rounded-2xl sm:p-8 md:p-12 md:shadow-xl">
					<h1 className="mb-4 font-extrabold text-2xl text-[#030370] sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl">
						Refund & Cancellation Policy
					</h1>

					<div className="space-y-6 text-gray-700 sm:space-y-8">
						<p className="text-sm leading-relaxed sm:text-base md:text-lg">
							At UNIEVENTS, we aim to provide a smooth experience for both users
							and event organizers. This policy outlines the terms related to
							cancellations and refunds.
						</p>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								1. Event-Based Refunds
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								All ticket purchases made through UNIEVENTS are subject to the
								refund and cancellation policies defined by the respective event
								organizers.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								2. Organizer Responsibility
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								Event organizers are solely responsible for deciding whether
								refunds are applicable in case of event cancellation,
								rescheduling, or other changes.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								3. Platform Role
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								UNIEVENTS acts only as a platform to facilitate event discovery
								and ticket booking. We do not guarantee refunds unless
								explicitly stated by the event organizer.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								4. Non-Refundable Cases
							</h2>
							<p className="mb-2 text-sm sm:text-base md:text-lg">
								Refunds will not be provided in the following cases:
							</p>
							<ul className="list-inside list-disc space-y-1 text-sm sm:space-y-2 sm:text-base md:space-y-1 md:text-lg">
								<li>Change of personal plans</li>
								<li>Failure to attend the event</li>
								<li>Incorrect details provided by the user</li>
							</ul>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								5. Event Cancellation
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								If an event is canceled by the organizer, the refund (if
								applicable) will be processed as per the organizer's policy.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								6. Processing Time
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								If a refund is approved, it may take 5–10 business days for the
								amount to reflect in the original payment method.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								7. Service Fees
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								Platform or convenience fees (if any) may be non-refundable.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								8. Contact
							</h2>
							<p className="mb-2 text-sm sm:text-base md:text-lg">
								For any refund-related queries, users may contact:
							</p>
							<p className="font-semibold text-sm sm:text-base md:text-lg">
								Email:{" "}
								<a
									href="mailto:support@unievents.in"
									className="text-[#030370] hover:underline"
								>
									support@unievents.in
								</a>
							</p>
						</section>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
