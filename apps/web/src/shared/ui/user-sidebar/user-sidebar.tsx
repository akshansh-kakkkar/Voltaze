"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import { USER_NAV_SECTIONS } from "@/shared/config/navigation";

export function UserSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const logoutMutation = useLogout();

	const isActive = (href: string) => {
		if (href === "/user/dashboard") return pathname === href;
		return pathname.startsWith(href) || (href === "/liked-events" && pathname === "/liked-events");
	};

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		router.push("/login");
	};

	return (
		<aside className="fixed top-16 bottom-0 left-0 z-40 hidden w-64 flex-col border-slate-200 border-r bg-white/90 backdrop-blur-md md:flex">
			<nav className="flex-1 overflow-y-auto px-4 py-5">
				<div className="space-y-6">
					{USER_NAV_SECTIONS.map((section) => (
						<div key={section.title}>
							<p className="px-3 font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
								{section.title}
							</p>
							<ul className="mt-3 space-y-1">
								{section.items.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href as never}
											className={cn(
												"group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
												isActive(item.href)
													? "bg-[#030370] text-white shadow-[0_14px_40px_rgba(3,3,112,0.25)]"
													: "text-slate-700 hover:bg-slate-100",
											)}
										>
											<span
												className={cn(
													"shrink-0 transition-colors",
													isActive(item.href)
														? "text-white"
														: "text-slate-500 group-hover:text-slate-700",
												)}
											>
												{item.icon}
											</span>
											<span className="flex-1 font-semibold text-sm">
												{item.label}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</nav>

			<div className="border-slate-200 border-t px-4 py-4">
				<button
					type="button"
					onClick={handleLogout}
					disabled={logoutMutation.isPending}
					className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<LogOut className="h-5 w-5" />
					<span className="font-semibold text-sm">Logout</span>
				</button>
			</div>
		</aside>
	);
}
