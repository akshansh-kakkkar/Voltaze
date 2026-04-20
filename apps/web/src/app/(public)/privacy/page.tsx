import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar";

export default function PrivacyPolicyPage() {
	return (
		<div className="flex min-h-screen flex-col bg-[#EBF3FF]">
			<Navbar />
			<main className="flex-1 px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
				<div className="mx-auto max-w-4xl rounded-xl bg-white p-5 shadow-lg sm:rounded-2xl sm:p-8 md:p-12 md:shadow-xl">
					<h1 className="mb-4 font-extrabold text-2xl text-[#030370] sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl">
						Privacy Policy
					</h1>

					<div className="space-y-6 text-gray-700 sm:space-y-8">
						<p className="text-sm leading-relaxed sm:text-base md:text-lg">
							At UNIEVENTS, we value your privacy and are committed to
							protecting your personal information. This Privacy Policy explains
							how we collect, use, and safeguard your data when you use our
							platform.
						</p>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								1. Information We Collect
							</h2>
							<p className="mb-2 text-sm sm:text-base md:text-lg">
								We may collect the following information:
							</p>
							<ul className="list-inside list-disc space-y-1 text-sm sm:space-y-2 sm:text-base md:space-y-1 md:text-lg">
								<li>Name, email address, and phone number</li>
								<li>College or organization details</li>
								<li>Event participation and ticket information</li>
								<li>
									Payment-related information (processed via third-party
									services)
								</li>
							</ul>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								2. How We Use Your Information
							</h2>
							<p className="mb-2 text-sm sm:text-base md:text-lg">
								We use the collected data to:
							</p>
							<ul className="list-inside list-disc space-y-1 text-sm sm:space-y-2 sm:text-base md:space-y-1 md:text-lg">
								<li>Enable event registration and ticket booking</li>
								<li>Process payments securely</li>
								<li>
									Generate certificates and provide event-related services
								</li>
								<li>
									Communicate updates, notifications, and important information
								</li>
								<li>Improve our platform and user experience</li>
							</ul>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								3. Payment Processing
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								We use secure third-party payment gateways to process payments.
								We do not store your card or banking details on our servers.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								4. Data Sharing
							</h2>
							<p className="mb-2 text-sm sm:text-base md:text-lg">
								We do not sell or rent your personal data. However, we may share
								limited information with trusted third-party services such as:
							</p>
							<ul className="list-inside list-disc space-y-1 text-sm sm:space-y-2 sm:text-base md:space-y-1 md:text-lg">
								<li>Payment gateways</li>
								<li>Email and notification service providers</li>
							</ul>
							<p className="mt-2 text-gray-500 text-xs sm:text-sm">
								only to operate and improve our platform.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								5. Data Security
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								We implement reasonable security measures to protect your
								information from unauthorized access, misuse, or disclosure.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								6. Cookies
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								We may use cookies and similar technologies to enhance user
								experience and improve our services.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								7. User Rights
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								Users may request access, correction, or deletion of their
								personal data by contacting us.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								8. Third-Party Links
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								Our platform may contain links to third-party websites. We are
								not responsible for their privacy practices.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								9. Changes to This Policy
							</h2>
							<p className="text-sm sm:text-base md:text-lg">
								We may update this Privacy Policy from time to time. Users are
								advised to review this page periodically.
							</p>
						</section>

						<section>
							<h2 className="mb-2 font-bold text-black text-lg sm:mb-3 sm:text-xl md:text-2xl">
								10. Contact Us
							</h2>
							<p className="mb-2 text-sm sm:text-base md:text-lg">
								If you have any questions or concerns regarding this Privacy
								Policy, you can contact us at:
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

						<div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4 text-center font-medium text-gray-800 text-xs sm:mt-8 sm:p-5 sm:text-sm md:text-base">
							By using our platform, you agree to this Privacy Policy.
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
