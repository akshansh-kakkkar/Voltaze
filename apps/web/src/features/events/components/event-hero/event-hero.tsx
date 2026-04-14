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
		<div className="flex min-h-[calc(100vh-60px)] w-full flex-col items-center justify-center bg-[#EBF3FF] sm:min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)]">
			<Navbar />

			<main className="flex w-full flex-1 items-center justify-center">
				<div className="w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-20 lg:py-28">
					<div className="flex flex-col items-center gap-2 text-center sm:gap-3 md:gap-4">
						<h1 className="font-extrabold text-black text-xl leading-tight tracking-tighter sm:text-2xl md:text-4xl lg:text-6xl xl:text-8xl">
							Discover and Book
						</h1>

						<h2 className="mt-1 font-extrabold text-[#030370] text-lg leading-tight tracking-tighter sm:mt-2 sm:text-xl sm:leading-[0.95] md:text-3xl lg:text-5xl xl:text-7xl">
							Events Effortlessly
						</h2>

						<p className="mt-2 max-w-2xl px-2 font-semibold text-[#6B7280] text-xs leading-relaxed sm:mt-3 sm:px-3 sm:text-sm md:mt-4 md:text-base lg:text-lg">
							From Front Row Fan To Sold Out Host
							<br />
							Everything You Need To Live And Lead The Experience.
						</p>

						<Button
							onClick={handleDiscoverEvents}
							className="mt-4 h-9 rounded-full bg-[#030370] px-4 font-bold text-white text-xs shadow-[0_0_10px_0_rgba(71,114,230,1)] transition-transform hover:-translate-y-0.5 hover:bg-[#030370]/90 active:scale-95 sm:mt-5 sm:h-10 sm:px-6 sm:text-sm md:mt-6 md:h-12 md:px-8 md:text-base lg:h-14 lg:px-10 lg:text-base"
						>
							Discover Events
						</Button>

						<div className="mt-4 flex w-full justify-center px-2 sm:mt-6 sm:px-3 md:mt-8 md:px-0 lg:mt-10">
							<div className="w-full max-w-4xl space-y-2 sm:space-y-3 sm:rounded-2xl sm:bg-white sm:p-2 sm:shadow-md md:space-y-0 md:rounded-full md:bg-white md:p-1.5 md:shadow-lg lg:p-2">
								{/* Mobile: Stack vertically */}
								<div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-md sm:hidden sm:gap-3 sm:rounded-2xl sm:border-transparent sm:p-4">
									<div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 sm:rounded-xl sm:px-3">
										<Search
											size={16}
											className="shrink-0 text-slate-600"
											strokeWidth={2.5}
										/>
										<div
											ref={searchMenuRef}
											className="relative min-w-0 flex-1"
										>
											<Input
												type="text"
												placeholder="Find events..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												onFocus={() => setShowSearchSuggestions(true)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleSearch();
												}}
												className="h-auto border-none bg-transparent p-0 font-medium text-gray-800 text-xs shadow-none placeholder:text-gray-400 focus-visible:ring-0 sm:text-sm"
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
									<Button
										onClick={handleSearch}
										className="h-9 w-full rounded-lg bg-[#030370] px-4 font-bold text-white text-xs shadow-md transition-all hover:bg-[#030370]/90 active:scale-95 sm:h-10 sm:rounded-xl sm:text-sm"
									>
										Search Events
									</Button>
								</div>

								{/* Tablet and Desktop: Horizontal layout */}
								<div className="hidden w-full items-center gap-1.5 sm:flex sm:gap-2 md:gap-3">
									<div className="flex flex-1 items-center gap-1.5 px-2 sm:gap-2 sm:px-3 md:px-4">
										<Search
											size={16}
											className="shrink-0 text-slate-700 sm:size-[18px] md:size-5"
											strokeWidth={2}
										/>
										<div
											ref={searchMenuRef}
											className="relative w-full min-w-0"
										>
											<Input
												type="text"
												placeholder="Search events"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												onFocus={() => setShowSearchSuggestions(true)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleSearch();
												}}
												className="h-auto border-none bg-transparent p-0 font-medium text-gray-700 text-xs shadow-none placeholder:text-xs focus-visible:ring-0 sm:text-sm sm:placeholder:text-sm md:text-base"
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

									<div className="hidden h-4 w-px bg-gray-200 md:block md:h-5 lg:h-6" />

									<div
										ref={locationMenuRef}
										className="relative hidden items-center gap-1.5 px-2 md:flex md:gap-2 md:px-4 lg:px-6"
									>
										<button
											type="button"
											onClick={() => setIsLocationMenuOpen((prev) => !prev)}
											className="flex items-center gap-0.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-slate-50 md:gap-1 md:px-2 md:py-1.5"
											aria-expanded={isLocationMenuOpen}
											aria-label="Open location menu"
										>
											<MapPin
												size={16}
												className="shrink-0 text-slate-700 md:size-[18px] lg:size-5"
												strokeWidth={2}
											/>
											<span className="hidden w-20 truncate text-left font-medium text-gray-700 text-xs sm:w-24 md:inline md:w-28 md:text-sm lg:w-32 lg:text-base">
												{location || "Location"}
											</span>
											<ChevronDown
												className={`h-3 w-3 text-slate-500 transition-transform md:h-4 md:w-4 ${
													isLocationMenuOpen ? "rotate-180" : "rotate-0"
												}`}
											/>
										</button>

										<div
											className={`absolute top-full right-0 z-50 mt-1.5 w-40 rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_18px_40px_rgba(7,1,144,0.16)] transition-all sm:w-48 sm:p-1.5 md:mt-2 md:w-56 md:p-2 lg:w-64 ${
												isLocationMenuOpen
													? "pointer-events-auto translate-y-0 opacity-100"
													: "pointer-events-none -translate-y-1 opacity-0"
											}`}
										>
											<button
												type="button"
												onClick={handleUseLiveLocation}
												disabled={isLocating}
												className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-medium text-[#070190] text-xs transition-colors hover:bg-[#f4f6ff] disabled:cursor-not-allowed disabled:opacity-70 md:rounded-xl md:px-3 md:py-2 md:text-sm"
											>
												<LocateFixed className="h-4 w-4 flex-shrink-0" />
												{isLocating
													? "Fetching live location..."
													: "Fetch live location"}
											</button>

											<button
												type="button"
												onClick={handleBrowseOnlineEvents}
												className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-medium text-[#070190] text-xs transition-colors hover:bg-[#f4f6ff] md:rounded-xl md:px-3 md:py-2 md:text-sm"
											>
												<Globe className="h-4 w-4 flex-shrink-0" />
												Browse online events
											</button>

											<div className="my-0.5 border-slate-100 border-t md:my-1" />
											<p className="px-2 py-0.5 font-semibold text-[10px] text-slate-500 uppercase tracking-wide md:px-3 md:py-1 md:text-[11px]">
												Popular cities
											</p>

											{locationOptions.map((option) => (
												<button
													key={option.toLowerCase()}
													type="button"
													onClick={() => handlePickLocation(option)}
													className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-medium text-slate-700 text-xs transition-colors hover:bg-[#f4f6ff] hover:text-[#030370] md:rounded-xl md:px-3 md:py-2 md:text-sm"
												>
													<MapPin className="h-3 w-3 flex-shrink-0 md:h-3.5 md:w-3.5" />
													{option}
												</button>
											))}
										</div>
									</div>

									<Button
										onClick={handleSearch}
										className="h-8 flex-shrink-0 rounded-lg bg-[#030370] px-3 font-bold text-white text-xs shadow-md transition-all hover:bg-[#030370]/90 active:scale-95 sm:h-9 sm:px-4 sm:text-sm md:h-10 md:rounded-lg md:px-5 md:text-base lg:h-12 lg:px-8 lg:text-base"
									>
										Search
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
