"use client";

import { MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Navbar() {
	const router = useRouter();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showScrolledSearch, setShowScrolledSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [location, setLocation] = useState("patiala");

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	useEffect(() => {
		const handleScroll = () => {
			const heroThreshold = Math.max(window.innerHeight - 120, 220);
			setShowScrolledSearch(window.scrollY > heroThreshold);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, []);

	const handleSearch = () => {
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set("search", searchQuery);
		}

		if (location) {
			params.set("location", location);
		}

		router.push(`/events?${params.toString()}`);
		closeMobileMenu();
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-slate-100 border-b bg-white/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:gap-8">
				<div className="flex items-center">
					<Link
						href="/"
						className="flex shrink-0 items-center gap-2"
						onClick={closeMobileMenu}
					>
						<Image
							src="/assets/logo.webp"
							alt="UniEvent logo"
							width={50}
							height={40}
							priority
						/>
						<span className="font-black text-2xl text-[#070190] leading-none tracking-tight md:text-[29px]">
							UniEvent
						</span>
					</Link>
				</div>

				<div
					className={`hidden flex-1 items-center justify-center transition-all duration-300 lg:flex ${
						showScrolledSearch
							? "pointer-events-auto translate-y-0 opacity-100"
							: "pointer-events-none -translate-y-2 opacity-0"
					}`}
				>
					<div className="w-full max-w-2xl rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_8px_30px_rgba(7,1,144,0.08)]">
						<div className="flex items-center gap-2">
							<div className="flex min-w-0 flex-1 items-center gap-2 px-3">
								<Search className="h-4 w-4 shrink-0 text-slate-500" />
								<Input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={handleSearchKeyDown}
									placeholder="Search events"
									className="h-auto border-none bg-transparent p-0 font-medium text-[15px] text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
								/>
							</div>

							<div className="h-8 w-px bg-slate-200" />

							<div className="hidden items-center gap-2 px-3 md:flex">
								<MapPin className="h-4 w-4 shrink-0 text-slate-500" />
								<select
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className="w-30 cursor-pointer border-none bg-transparent font-semibold text-[#070190] text-sm outline-none"
								>
									<option value="patiala">Patiala</option>
									<option value="chandigarh">Chandigarh</option>
									<option value="delhi">Delhi</option>
									<option value="mumbai">Mumbai</option>
								</select>
							</div>

							<Button
								type="button"
								onClick={handleSearch}
								className="h-10 w-10 rounded-full bg-[#030370] p-0 text-white shadow-none hover:bg-[#030370]/90"
								aria-label="Search events"
							>
								<Search className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				<nav className="hidden items-center gap-3 md:flex lg:gap-4">
					<Link
						href="/events"
						className="rounded-full border border-transparent px-4 py-2 font-semibold text-slate-700 text-sm transition-all hover:border-[#dfe3f6] hover:bg-[#f4f6ff] hover:text-[#030370]"
					>
						Discover
					</Link>
					<Link
						href="/events"
						className="rounded-full border border-[#e6e9f8] bg-[#f9faff] px-4 py-2 font-semibold text-[#030370] text-sm transition-all hover:border-[#cad2f4] hover:bg-[#eef1ff]"
					>
						Create Event +
					</Link>
				</nav>

				<div className="hidden items-center gap-3 md:flex">
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

				<button
					type="button"
					className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-[#070190] md:hidden"
					onClick={() => setIsMobileMenuOpen((prev) => !prev)}
					aria-label="Toggle navigation menu"
					aria-expanded={isMobileMenuOpen}
				>
					<span className="flex flex-col gap-1">
						<span className="block h-0.5 w-5 bg-current" />
						<span className="block h-0.5 w-5 bg-current" />
						<span className="block h-0.5 w-5 bg-current" />
					</span>
				</button>
			</div>

			{isMobileMenuOpen && (
				<div className="border-slate-100 border-t bg-white px-6 pb-6 md:hidden">
					<div className="flex flex-col gap-4 pt-4">
						<Link
							href="/"
							className="font-black text-2xl text-[#070190] tracking-tight"
							onClick={closeMobileMenu}
						>
							UniEvent
						</Link>
						<Link
							href="/events"
							className="font-bold text-slate-700 text-sm"
							onClick={closeMobileMenu}
						>
							Discover
						</Link>
						<Link
							href="/events"
							className="font-bold text-slate-700 text-sm"
							onClick={closeMobileMenu}
						>
							Create Event +
						</Link>
						<div className="mt-2 flex flex-col gap-3">
							<div className="rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_8px_24px_rgba(7,1,144,0.08)]">
								<div className="flex items-center gap-2">
									<div className="flex min-w-0 flex-1 items-center gap-2 px-3">
										<Search className="h-4 w-4 shrink-0 text-slate-500" />
										<Input
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyDown={handleSearchKeyDown}
											placeholder="Search events"
											className="h-auto border-none bg-transparent p-0 font-medium text-slate-700 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-0"
										/>
									</div>
									<Button
										type="button"
										onClick={handleSearch}
										className="h-9 w-9 rounded-full bg-[#030370] p-0 text-white shadow-none hover:bg-[#030370]/90"
										aria-label="Search events"
									>
										<Search className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<Button
								asChild
								variant="ghost"
								className="justify-center rounded-4xl border-2 border-gray-400 font-bold text-slate-600 hover:text-[#030370]"
							>
								<Link href="/login" onClick={closeMobileMenu}>
									Login
								</Link>
							</Button>
							<Button
								asChild
								className="justify-center rounded-full bg-[#030370] px-6 font-bold text-white shadow-[0_0_5px_0_rgba(71,114,230,1)] transition-all hover:bg-[#030370]/90 active:scale-95"
							>
								<Link href="/signup" onClick={closeMobileMenu}>
									Sign Up
								</Link>
							</Button>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
