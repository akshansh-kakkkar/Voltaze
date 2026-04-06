"use client";

import { MapPin, Search } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Navbar } from "@/shared/ui/navbar";

export function EventHero() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [location, setLocation] = useState<string>("chandigarh");

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchQuery) params.append("search", searchQuery);
		if (location) params.append("location", location);

		router.push(`/events?${params.toString()}`);
	};

	const handleDiscoverEvents = () => {
		router.push("/events");
	};

	return (
		<div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-[#EBF3FF]">
			<Navbar />

			<main className="flex w-full flex-1 items-center justify-center">
				<div className="w-full max-w-[1152px] px-6 py-24 md:py-32">
					<div className="flex flex-col items-center gap-3 text-center">
						<h1 className="font-extrabold text-4xl text-black leading-tight tracking-tighter md:text-8xl">
							Discover and Book
						</h1>

						<h2 className="mt-3 font-extrabold text-3xl text-[#030370] leading-[0.95] tracking-tighter md:text-7xl">
							Events Effortlessly
						</h2>

						<p className="mt-4 max-w-2xl px-4 font-semibold text-[#6B7280] text-base leading-relaxed md:text-xl">
							From Front Row Fan To Sold Out Host
							<br />
							Everything You Need To Live And Lead The Experience.
						</p>

						<Button
							onClick={handleDiscoverEvents}
							size="lg"
							className="mt-6 h-14 rounded-full bg-[#030370] px-10 font-bold text-white shadow-[0_0_10px_0_rgba(71,114,230,1)] transition-transform hover:-translate-y-0.5 hover:bg-[#030370]/90"
						>
							Discover Events
						</Button>

						<div className="mt-8 flex w-full justify-center">
							<div className="w-full max-w-4xl rounded-full border border-gray-100 bg-white p-2 shadow-2xl">
								<div className="flex items-center">
									<div className="flex flex-1 items-center gap-3 px-4">
										<Search
											size={22}
											className="shrink-0 text-slate-700"
											strokeWidth={2}
										/>
										<Input
											type="text"
											placeholder="Search For Events Near You"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSearch();
											}}
											className="h-auto border-none bg-transparent p-0 font-medium text-gray-700 text-lg shadow-none focus-visible:ring-0"
										/>
									</div>

									<div className="hidden h-10 w-px bg-gray-200 md:block" />

									<div className="hidden items-center gap-3 px-6 md:flex">
										<MapPin
											size={20}
											className="shrink-0 text-slate-700"
											strokeWidth={2}
										/>
										<Select
											value={location}
											onChange={(e) => setLocation(e.target.value)}
											className="w-[220px] cursor-pointer border-none bg-transparent font-medium text-base text-gray-700 outline-none"
										>
											<option value="chandigarh">Chandigarh</option>
											<option value="delhi">Delhi</option>
											<option value="mumbai">Mumbai</option>
											<option value="bangalore">Bangalore</option>
										</Select>
									</div>

									<div className="md:px-4">
										<Button
											onClick={handleSearch}
											className="h-12 rounded-full bg-[#030370] px-8 font-bold text-white shadow-[0_0_10px_0_rgba(71,114,230,1)] transition-opacity hover:bg-[#030370]/90 hover:opacity-90 active:scale-95"
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
