import Link from "next/link";

export function Footer() {
	return (
		<footer className="bg-[#030370] pt-8 pb-6 text-white sm:pt-12 sm:pb-8 md:pt-16 md:pb-10 lg:pt-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 grid grid-cols-1 gap-6 sm:mb-12 sm:gap-8 md:mb-16 md:grid-cols-2 lg:mb-20 lg:grid-cols-4 lg:gap-12">
					<div className="lg:col-span-1">
						<h2 className="mb-3 font-black text-xl leading-tight tracking-tighter sm:mb-4 sm:text-2xl md:mb-6 md:text-3xl">
							VOLTAZE
						</h2>
						<p className="max-w-xs font-medium text-blue-200 text-xs leading-relaxed sm:text-sm md:text-base">
							Discover and book events you'll actually love attending- college
							fests, tech talks, concerts, workshops & community meetups
						</p>
					</div>

					<div>
						<h3 className="mb-3 font-bold text-base leading-tight sm:mb-4 sm:text-lg md:mb-6 md:text-xl">
							Discover
						</h3>
						<div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Browse All Events
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Tech Events
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Music & Concerts
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								College Fests
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Free Events
							</Link>
						</div>
					</div>

					<div>
						<h3 className="mb-3 font-bold text-base leading-tight sm:mb-4 sm:text-lg md:mb-6 md:text-xl">
							Account
						</h3>
						<div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
							<Link
								href="/register"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Sign Up Free
							</Link>
							<Link
								href="/login"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Log in
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								My Bookings
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								My Passes
							</Link>
							<Link
								href="/login"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Profile Settings
							</Link>
						</div>
					</div>

					<div>
						<h3 className="mb-3 font-bold text-base leading-tight sm:mb-4 sm:text-lg md:mb-6 md:text-xl">
							Help
						</h3>
						<div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Help Centre
							</Link>
							<Link
								href="/refund"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Refund Policy
							</Link>
							<Link
								href="/privacy"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Privacy Policy
							</Link>
							<Link
								href="/terms"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Terms of Service
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Contact Us
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Sponsor Request
							</Link>
							<Link
								href="/"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								About Voltaze
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 text-xs transition-colors hover:text-white sm:text-sm md:text-base"
							>
								Host an Event
							</Link>
						</div>
					</div>
				</div>

				<div className="mb-4 h-px w-full bg-white/10 sm:mb-6 md:mb-8" />

				<div className="flex flex-col items-center justify-between gap-3 font-medium text-blue-200 text-xs sm:gap-4 sm:text-sm md:text-base">
					<div>© {new Date().getFullYear()} Voltaze. All rights reserved.</div>
					<div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4 md:gap-6">
						<Link
							href="/privacy"
							className="transition-colors hover:text-white"
						>
							Privacy Policy
						</Link>
						<Link href="/terms" className="transition-colors hover:text-white">
							Terms of Service
						</Link>
						<Link
							href="/privacy"
							className="transition-colors hover:text-white"
						>
							Cookie Policy
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
