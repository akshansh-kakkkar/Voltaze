"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-slate-100 border-b bg-white/80 backdrop-blur-md">
			<div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6">
				<div className="flex items-center">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/assets/logo.webp"
							alt="logo"
							width={60}
							height={48}
							priority
						/>
					</Link>
				</div>

				<nav className="hidden items-center gap-8 md:flex">
					<Link
						href="/events"
						className="font-bold text-slate-600 text-sm transition-colors hover:text-[#030370]"
					>
						Discover
					</Link>
					<Link
						href="/how-it-works"
						className="font-bold text-slate-600 text-sm transition-colors hover:text-[#030370]"
					>
						How it works
					</Link>
					<Link
						href="/my-tickets"
						className="font-bold text-slate-600 text-sm transition-colors hover:text-[#030370]"
					>
						My Tickets
					</Link>
					<Link
						href="/my-bookings"
						className="font-bold text-slate-600 text-sm transition-colors hover:text-[#030370]"
					>
						My Bookings
					</Link>
				</nav>

				<div className="flex items-center gap-4">
					<Button
						asChild
						variant="ghost"
						className="rounded-4xl border-2 border-gray-400 font-bold text-slate-600 hover:text-[#030370]"
					>
						<Link href="/login">Login</Link>
					</Button>
					<Button
						asChild
						className="rounded-full bg-[#030370] px-6 font-bold text-white shadow-[0_0_5px_0_rgba(71,114,230,1)] transition-all hover:bg-[#030370]/90 active:scale-95"
					>
						<Link href="/signup">Sign Up</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
