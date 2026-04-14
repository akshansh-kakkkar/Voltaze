"use client";

import { ChevronDown, Globe, LocateFixed, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveLocation } from "@/shared/hooks/use-live-location";
import { startTopLoader } from "@/shared/lib/top-loader-events";

type Option = {
	id: string;
	label: string;
};

const CATEGORY_OPTIONS: Option[] = [
	{ id: "", label: "Category" },
	{ id: "tech-dev", label: "Tech & Dev" },
	{ id: "music", label: "Music" },
	{ id: "college-fests", label: "College Fests" },
	{ id: "workshops", label: "Workshops" },
	{ id: "art-culture", label: "Art & Culture" },
	{ id: "meetups", label: "Meetups" },
];

const MODE_OPTIONS: Option[] = [
	{ id: "", label: "Mode" },
	{ id: "ONLINE", label: "Online" },
	{ id: "OFFLINE", label: "Offline" },
];

const TYPE_OPTIONS: Option[] = [
	{ id: "", label: "Price" },
	{ id: "FREE", label: "Free" },
	{ id: "PAID", label: "Paid" },
];

const LOCATION_OPTIONS = ["Patiala", "Chandigarh", "Delhi", "Mumbai"];

export type EventsPageFiltersProps = {
	category?: string;
	mode?: string;
	type?: string;
	location?: string;
};

export function EventsPageFilters({
	category,
	mode,
	type,
	location,
}: EventsPageFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
	const locationMenuRef = useRef<HTMLDivElement | null>(null);
	const {
		location: liveLocation,
		setLocation,
		detectLocation,
		isLocating,
	} = useLiveLocation({ fallback: "Patiala" });

	const selectedLocation = location || liveLocation || "Patiala";

	const locationOptions = useMemo(() => {
		if (
			selectedLocation &&
			!LOCATION_OPTIONS.some(
				(item) => item.toLowerCase() === selectedLocation.toLowerCase(),
			)
		) {
			return [selectedLocation, ...LOCATION_OPTIONS];
		}

		return LOCATION_OPTIONS;
	}, [selectedLocation]);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!locationMenuRef.current?.contains(target)) {
				setIsLocationMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

	const updateParams = (entries: Record<string, string>) => {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(entries).forEach(([key, value]) => {
			if (!value) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		});

		startTopLoader();
		router.push(`/events?${params.toString()}`);
	};

	const handleLocationSelect = (value: string) => {
		setLocation(value);
		updateParams({
			location: value,
			mode:
				value.toLowerCase() === "online"
					? "ONLINE"
					: mode === "ONLINE"
						? ""
						: mode || "",
		});
		setIsLocationMenuOpen(false);
	};

	const handleUseLiveLocation = async () => {
		const detected = await detectLocation();
		if (detected) {
			setLocation(detected);
			updateParams({
				location: detected,
				mode: mode === "ONLINE" ? "" : mode || "",
			});
		}
		setIsLocationMenuOpen(false);
	};

	const handleBrowseOnlineEvents = () => {
		setLocation("Online");
		updateParams({ location: "online", mode: "ONLINE" });
		setIsLocationMenuOpen(false);
	};

	const handleSelectChange = (
		key: "category" | "mode" | "type",
		value: string,
	) => {
		updateParams({ [key]: value } as Record<string, string>);
	};

	const clearAll = () => {
		startTopLoader();
		router.push("/events");
		setIsLocationMenuOpen(false);
	};

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-5 lg:p-6">
			<div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div
					ref={locationMenuRef}
					className="relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm sm:rounded-xl sm:px-3 sm:py-2 lg:rounded-2xl lg:px-4 lg:py-2.5"
				>
					<button
						type="button"
						onClick={() => setIsLocationMenuOpen((prev) => !prev)}
						className="flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-white sm:gap-2 sm:px-1.5 sm:py-1 lg:px-2"
						aria-expanded={isLocationMenuOpen}
						aria-label="Open location menu"
					>
						<MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500 sm:h-4 sm:w-4" />
						<span className="max-w-[100px] truncate font-semibold text-[#070190] text-xs sm:max-w-[140px] sm:text-sm lg:max-w-[160px]">
							{selectedLocation || "Select location"}
						</span>
						<ChevronDown
							className={`h-3 w-3 shrink-0 text-slate-500 transition-transform sm:h-3.5 sm:w-3.5 ${
								isLocationMenuOpen ? "rotate-180" : "rotate-0"
							}`}
						/>
					</button>

					<div
						className={`absolute top-full left-0 z-50 mt-2 w-screen max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(7,1,144,0.16)] transition-all sm:w-80 sm:max-w-none md:w-96 lg:w-64 ${
							isLocationMenuOpen
								? "pointer-events-auto translate-y-0 opacity-100"
								: "pointer-events-none -translate-y-1 opacity-0"
						}`}
					>
						<button
							type="button"
							onClick={handleUseLiveLocation}
							disabled={isLocating}
							className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-[#070190] text-xs transition-colors hover:bg-[#f4f6ff] disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-xl sm:px-3 sm:text-sm"
						>
							<LocateFixed className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
							{isLocating ? "Fetching live location..." : "Fetch live location"}
						</button>

						<button
							type="button"
							onClick={handleBrowseOnlineEvents}
							className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-[#070190] text-xs transition-colors hover:bg-[#f4f6ff] sm:rounded-xl sm:px-3 sm:text-sm"
						>
							<Globe className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
							Browse online events
						</button>

						<div className="my-1 border-slate-100 border-t" />

						{locationOptions.map((option) => (
							<button
								key={option.toLowerCase()}
								type="button"
								onClick={() => handleLocationSelect(option)}
								className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-slate-700 text-xs transition-colors hover:bg-[#f4f6ff] hover:text-[#030370] sm:rounded-xl sm:px-3 sm:text-sm"
							>
								<MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
								{option}
							</button>
						))}
					</div>
				</div>

				<div className="grid flex-1 grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3 lg:max-w-4xl lg:gap-4">
					<select
						value={category || ""}
						onChange={(event) =>
							handleSelectChange("category", event.target.value)
						}
						className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-semibold text-slate-900 text-xs shadow-sm outline-none transition-colors focus:border-[#030370] sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm md:h-11 lg:h-12 lg:rounded-2xl lg:px-4"
					>
						{CATEGORY_OPTIONS.map((option) => (
							<option key={option.id} value={option.id}>
								{option.label}
							</option>
						))}
					</select>

					<select
						value={mode || ""}
						onChange={(event) => handleSelectChange("mode", event.target.value)}
						className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-semibold text-slate-900 text-xs shadow-sm outline-none transition-colors focus:border-[#030370] sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm md:h-11 lg:h-12 lg:rounded-2xl lg:px-4"
					>
						{MODE_OPTIONS.map((option) => (
							<option key={option.id} value={option.id}>
								{option.label}
							</option>
						))}
					</select>

					<select
						value={type || ""}
						onChange={(event) => handleSelectChange("type", event.target.value)}
						className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-semibold text-slate-900 text-xs shadow-sm outline-none transition-colors focus:border-[#030370] sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm md:h-11 lg:h-12 lg:rounded-2xl lg:px-4"
					>
						{TYPE_OPTIONS.map((option) => (
							<option key={option.id} value={option.id}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center gap-2 self-end lg:self-auto">
					<Button
						type="button"
						variant="ghost"
						className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-slate-600 text-xs shadow-sm hover:border-[#030370] hover:bg-[#030370]/5 hover:text-[#030370] sm:h-10 sm:rounded-xl sm:px-4 sm:text-sm md:h-11 lg:h-12 lg:rounded-2xl lg:px-5"
						onClick={clearAll}
					>
						Reset
					</Button>
				</div>
			</div>
		</div>
	);
}
