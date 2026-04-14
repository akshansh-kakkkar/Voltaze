"use client";

import { useQueries } from "@tanstack/react-query";
import {
	GraduationCap,
	Laptop,
	Music,
	Palette,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";
import { eventsService } from "../../services";

const CATEGORIES = [
	{
		id: "tech-dev",
		title: "Tech & Dev",
		search: "tech",
		Icon: Laptop,
		bg: "bg-slate-100",
		color: "text-slate-900",
	},
	{
		id: "music",
		title: "Music",
		search: "music",
		Icon: Music,
		bg: "bg-white",
		color: "text-slate-900",
	},
	{
		id: "college-fests",
		title: "College Fests",
		search: "fest",
		Icon: GraduationCap,
		bg: "bg-orange-50",
		color: "text-orange-500",
	},
	{
		id: "workshops",
		title: "Workshops",
		search: "workshop",
		Icon: Users,
		bg: "bg-gray-100",
		color: "text-gray-600",
	},
	{
		id: "art-culture",
		title: "Art & Culture",
		search: "comedy",
		Icon: Palette,
		bg: "bg-pink-50",
		color: "text-pink-500",
	},
	{
		id: "meetups",
		title: "Meetups",
		search: "meetup",
		Icon: UserPlus,
		bg: "bg-yellow-50",
		color: "text-yellow-600",
	},
];

export function EventCategories() {
	const categoryCountQueries = useQueries({
		queries: CATEGORIES.map((category) => ({
			queryKey: ["events", "category-count", category.id],
			queryFn: () =>
				eventsService.getEvents({
					page: 1,
					limit: 1,
					sortBy: "startDate",
					sortOrder: "asc",
					search: category.search,
				}),
			staleTime: 1000 * 60 * 5,
		})),
	});

	return (
		<section className="w-full bg-[#EBF3FF] py-12 sm:py-16 lg:py-20">
			<div className={"mx-auto max-w-7xl px-4 sm:px-6 lg:px-6"}>
				<h2 className="mb-8 text-center font-extrabold text-2xl text-black tracking-tight sm:text-3xl md:text-left md:text-4xl lg:text-5xl">
					What are you into?
				</h2>

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
					{CATEGORIES.map((category, index) => (
						<Link
							key={category.id}
							href={`/events?category=${category.id}`}
							className="group flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl sm:rounded-3xl sm:p-4"
						>
							<div
								className={`mb-3 rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 sm:mb-4 sm:rounded-2xl sm:p-4 ${category.bg}`}
							>
								<category.Icon
									className={`h-6 w-6 stroke-[1.5] sm:h-8 sm:w-8 ${category.color}`}
								/>
							</div>
							<h3 className="mb-1 font-bold text-[13px] text-black sm:text-base">
								{category.title}
							</h3>
							<span className="font-semibold text-gray-400 text-xs sm:text-sm">
								{categoryCountQueries[index]?.data?.meta?.total ?? 0} events
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
