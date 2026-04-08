"use client";

import { ChevronDown, Globe, LocateFixed, MapPin, Search } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiveLocation } from "@/shared/hooks/use-live-location";
import { startTopLoader } from "@/shared/lib/top-loader-events";
import { Navbar } from "@/shared/ui/navbar";
import { useEventSearch } from "../../hooks/use-event-search";
import { SearchSuggestions } from "../search-suggestions/search-suggestions";

export function EventHero() {
	const router = useRouter();
	const locationMenuRef = useRef<HTMLDivElement | null>(null);
	const searchMenuRef = useRef<HTMLDivElement | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
	const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
	const { suggestions, isLoading: isSuggestionsLoading } =
		useEventSearch(searchQuery);
	const { location, setLocation, detectLocation, isLocating } = useLiveLocation(
		{
			fallback: "Chandigarh",
		},
	);

	const locationOptions = useMemo(() => {
		const defaults = ["Chandigarh", "Delhi", "Mumbai", "Bangalore"];

		if (
			location &&
			!defaults.some((item) => item.toLowerCase() === location.toLowerCase())
		) {
			return [location, ...defaults];
		}

		return defaults;
	}, [location]);

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchQuery) params.append("search", searchQuery);
		if (location) params.append("location", location);

		startTopLoader();
		router.push(`/events?${params.toString()}`);
		setIsLocationMenuOpen(false);
	};

	const handleUseLiveLocation = async () => {
		await detectLocation();
		setIsLocationMenuOpen(false);
	};

	const handleBrowseOnlineEvents = () => {
		setLocation("Online");
		const params = new URLSearchParams();

		if (searchQuery) params.set("search", searchQuery);
		params.set("location", "online");
		params.set("mode", "ONLINE");

		startTopLoader();
		router.push(`/events?${params.toString()}`);
		setIsLocationMenuOpen(false);
	};

	const handlePickLocation = (value: string) => {
		setLocation(value);
		setIsLocationMenuOpen(false);
	};

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!locationMenuRef.current?.contains(target)) {
				setIsLocationMenuOpen(false);
			}
			if (!searchMenuRef.current?.contains(target)) {
				setShowSearchSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, []);

	const handleDiscoverEvents = () => {
		startTopLoader();
		router.push("/events");
	};

	return (
		<div className="relative flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_15%_20%,#dbe9ff_0%,#f4f8ff_38%,#eef3ff_100%)]">
			<div className="pointer-events-none absolute -top-28 -left-20 h-72 w-72 rounded-full bg-[#8bb1ff]/35 blur-3xl" />
			<div className="pointer-events-none absolute -right-24 -bottom-22 h-80 w-80 rounded-full bg-[#2f49b8]/20 blur-3xl" />
			<Navbar />

			<main className="relative z-10 flex w-full flex-1 items-center justify-center">
				<div className="w-full max-w-6xl px-6 py-24 md:py-32">
					<div className="mx-auto flex max-w-5xl flex-col items-center gap-4 rounded-4xl border border-white/60 bg-white/45 px-5 py-10 text-center shadow-[0_20px_70px_rgba(18,43,112,0.16)] backdrop-blur-2xl md:px-10 md:py-14">
						<h1 className="font-extrabold text-4xl text-[#06114e] leading-tight tracking-[-0.03em] md:text-7xl">
							Discover and Book Events
						</h1>

						<p className="mt-1 max-w-2xl px-2 font-medium text-[#4f5f86] text-base leading-relaxed md:text-xl">
							A clean, fast way to find shows, workshops, and experiences near
							you or online.
						</p>

						<Button
							onClick={handleDiscoverEvents}
							size="lg"
							className="mt-4 h-13 rounded-full bg-[#0c227f] px-10 font-bold text-white shadow-[0_10px_30px_rgba(12,34,127,0.32)] transition-transform hover:-translate-y-0.5 hover:bg-[#0c227f]/90"
						>
							Discover Events
						</Button>

						<div className="mt-8 flex w-full justify-center">
							<div className="w-full max-w-4xl rounded-[1.75rem] border border-white/70 bg-white/70 p-2 shadow-[0_18px_45px_rgba(16,36,99,0.16)] backdrop-blur-xl">
								<div className="flex items-center">
									<div className="flex flex-1 items-center gap-3 px-4">
										<Search
											size={22}
											className="shrink-0 text-slate-600"
											strokeWidth={2}
										/>
										<div ref={searchMenuRef} className="relative w-full">
											<Input
												type="text"
												placeholder="Search For Events Near You"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												onFocus={() => setShowSearchSuggestions(true)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleSearch();
												}}
												className="h-auto border-none bg-transparent p-0 font-medium text-gray-700 text-lg shadow-none placeholder:text-slate-400 focus-visible:ring-0"
											/>
											<SearchSuggestions
												suggestions={suggestions}
												isOpen={showSearchSuggestions && searchQuery.length > 0}
												isLoading={isSuggestionsLoading}
												onSuggestionSelect={() => {
													setShowSearchSuggestions(false);
													setSearchQuery("");
												}}
											/>
										</div>
									</div>

									<div className="hidden h-10 w-px bg-slate-200/80 md:block" />

									<div
										ref={locationMenuRef}
										className="relative hidden items-center gap-3 px-6 md:flex"
									>
										<button
											type="button"
											onClick={() => setIsLocationMenuOpen((prev) => !prev)}
											className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/70"
											aria-expanded={isLocationMenuOpen}
											aria-label="Open location menu"
										>
											<MapPin
												size={20}
												className="shrink-0 text-slate-700"
												strokeWidth={2}
											/>
											<span className="w-32 truncate text-left font-medium text-base text-gray-700">
												{location || "Select location"}
											</span>
											<ChevronDown
												className={`h-4 w-4 text-slate-500 transition-transform ${
													isLocationMenuOpen ? "rotate-180" : "rotate-0"
												}`}
											/>
										</button>

										<div
											className={`absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-[0_18px_40px_rgba(7,1,144,0.16)] backdrop-blur-xl transition-all ${
												isLocationMenuOpen
													? "pointer-events-auto translate-y-0 opacity-100"
													: "pointer-events-none -translate-y-1 opacity-0"
											}`}
										>
											<button
												type="button"
												onClick={handleUseLiveLocation}
												disabled={isLocating}
												className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[#070190] text-sm transition-colors hover:bg-[#f4f6ff] disabled:cursor-not-allowed disabled:opacity-70"
											>
												<LocateFixed className="h-4 w-4" />
												{isLocating
													? "Fetching live location..."
													: "Fetch live location"}
											</button>

											<button
												type="button"
												onClick={handleBrowseOnlineEvents}
												className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[#070190] text-sm transition-colors hover:bg-[#f4f6ff]"
											>
												<Globe className="h-4 w-4" />
												Browse online events
											</button>

											<div className="my-1 border-slate-100 border-t" />
											<p className="px-3 py-1 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
												Popular cities
											</p>

											{locationOptions.map((option) => (
												<button
													key={option.toLowerCase()}
													type="button"
													onClick={() => handlePickLocation(option)}
													className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
												>
													<MapPin className="h-3.5 w-3.5" />
													{option}
												</button>
											))}
										</div>
									</div>

									<div className="md:px-4">
										<Button
											onClick={handleSearch}
											className="h-12 rounded-full bg-[#0c227f] px-8 font-bold text-white shadow-[0_10px_24px_rgba(12,34,127,0.3)] transition-opacity hover:bg-[#0c227f]/90 hover:opacity-90 active:scale-95"
										>
											Search
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
