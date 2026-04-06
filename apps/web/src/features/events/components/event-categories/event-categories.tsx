import {
	GraduationCap,
	Laptop,
	Music,
	Palette,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
	{
		id: "tech-dev",
		title: "Tech & Dev",
		count: "234 events",
		Icon: Laptop,
		bg: "bg-slate-100",
		color: "text-slate-900",
	},
	{
		id: "music",
		title: "Music",
		count: "187 events",
		Icon: Music,
		bg: "bg-slate-100",
		color: "text-slate-900",
	},
	{
		id: "college-fests",
		title: "College Fests",
		count: "40 events",
		Icon: GraduationCap,
		bg: "bg-orange-50",
		color: "text-orange-500",
	},
	{
		id: "workshops",
		title: "Workshops",
		count: "158 events",
		Icon: Users,
		bg: "bg-gray-100",
		color: "text-gray-600",
	},
	{
		id: "art-culture",
		title: "Art & Culture",
		count: "80 events",
		Icon: Palette,
		bg: "bg-pink-50",
		color: "text-pink-500",
	},
	{
		id: "meetups",
		title: "Meetups",
		count: "108 events",
		Icon: UserPlus,
		bg: "bg-yellow-50",
		color: "text-yellow-600",
	},
];

export function EventCategories() {
	return (
		<section className="w-full bg-[#EBF3FF] py-20">
			<div className="mx-auto max-w-[1280px] px-6">
				<h2 className="mb-12 text-center font-extrabold text-4xl text-black tracking-tight md:text-left md:text-5xl">
					What are you into?
				</h2>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
					{CATEGORIES.map((category) => (
						<Link
							key={category.id}
							href={`/events?category=${category.id}`}
							className="group flex flex-col items-center rounded-[32px] border border-gray-100 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl"
						>
							<div
								className={`mb-6 rounded-2xl p-6 transition-transform duration-300 group-hover:scale-110 ${category.bg}`}
							>
								<category.Icon
									className={`h-12 w-12 stroke-[1.5] ${category.color}`}
								/>
							</div>
							<h3 className="mb-2 font-bold text-black text-xl">
								{category.title}
							</h3>
							<span className="font-semibold text-gray-400 text-sm">
								{category.count}
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
