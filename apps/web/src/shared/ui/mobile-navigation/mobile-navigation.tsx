"use client";

import {
	Menu,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCurrentUser, useLogout } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import {
	ADMIN_NAV_SECTIONS,
	HOST_NAV_SECTIONS,
	USER_NAV_SECTIONS,
} from "@/shared/config/navigation";

function getProfileInitial(
	name: string | null | undefined,
	email: string | null | undefined,
) {
	const base = name?.trim() || email?.trim() || "U";
	return base.charAt(0).toUpperCase();
}

export function MobileNavigation() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const { data: user } = useCurrentUser();
	const logoutMutation = useLogout();

	const isAdminRoute = pathname.startsWith("/admin");
	const isHostRoute = pathname.startsWith("/host");
	const isUserRoute =
		pathname.startsWith("/user") ||
		pathname.startsWith("/tickets") ||
		pathname.startsWith("/passes") ||
		pathname === "/liked-events";

	const sections = useMemo(() => {
		if (isAdminRoute) return ADMIN_NAV_SECTIONS;
		if (isHostRoute) return HOST_NAV_SECTIONS;
		if (isUserRoute) return USER_NAV_SECTIONS;
		return [];
	}, [isAdminRoute, isHostRoute, isUserRoute]);

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	if (!user || sections.length === 0) return null;

	const isActive = (href: string) => {
		if (href.endsWith("/dashboard")) {
			return pathname === href;
		}
		return pathname.startsWith(href);
	};

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		setIsOpen(false);
		router.push("/login");
	};

	const profileInitial = getProfileInitial(user?.name, user?.email);

	return (
		<>
			{/* Floating Hamburger Trigger - Only on mobile */}
			<div className="fixed left-6 bottom-6 z-40 md:hidden">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#030370] text-[#030370] shadow-[0_8px_30px_rgba(7,1,144,0.3)] transition-all active:scale-90"
					aria-label="Open mobile navigation"
				>
					<Menu className="h-5 w-5" />
				</button>
			</div>

			{/* Backdrop */}
			<div
				className={cn(
					"fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden",
					isOpen ? "opacity-100" : "pointer-events-none opacity-0"
				)}
				onClick={() => setIsOpen(false)}
			/>

			{/* Sliding Bottom Sheet */}
			<div
				className={cn(
					"fixed right-0 bottom-0 left-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl bg-[#eaedf5] shadow-2xl transition-transform duration-300 ease-out md:hidden",
					isOpen ? "translate-y-0" : "translate-y-full"
				)}
			>
				{/* Drawer Header */}
				<div className="flex items-center justify-between border-[#dce1f0] border-b px-6 py-5">
					<h2 className="font-bold text-[#030370] text-xl">Navigation</h2>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="rounded-full p-2 transition-colors hover:bg-black/5"
						aria-label="Close navigation"
					>
						<X className="h-5 w-5 text-[#030370]" />
					</button>
				</div>

				{/* Nav Sections List */}
				<div className="flex-1 overflow-y-auto px-4 py-3">
					<div className="space-y-6">
						{sections.map((section) => (
							<div key={section.title}>
								<p className="px-4 font-bold text-[11px] text-slate-400 uppercase tracking-[2px]">
									{section.title}
								</p>
								<ul className="mt-2 space-y-[2px]">
									{section.items.map((item) => {
										const active = isActive(item.href);
										return (
											<li key={item.label}>
												<Link
													href={item.href}
													className={cn(
														"flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all",
														active
															? "bg-[#d9e0f3] text-[#030370] shadow-sm"
															: "text-slate-600 hover:bg-black/5"
													)}
												>
													<span
														className={
															active ? "text-[#030370]" : "text-slate-500"
														}
													>
														{item.icon}
													</span>
													<span
														className={cn(
															"text-[16px]",
															active ? "font-bold" : "font-semibold"
														)}
													>
														{item.label}
													</span>
												</Link>
											</li>
										);
									})}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Drawer Footer */}
				<div className="flex items-center justify-between border-[#dce1f0] border-t px-6 py-4 pb-10">
					<div className="flex items-center gap-4">
						<div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#030370] font-bold text-white shadow-sm">
							{profileInitial}
						</div>
						<button
							type="button"
							onClick={handleLogout}
							disabled={logoutMutation.isPending}
							className="font-bold text-[#e11d48] text-[15px] hover:opacity-80 active:opacity-70"
						>
							{logoutMutation.isPending ? "Logging out..." : "Logout"}
						</button>
					</div>

					<div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-white">
						{user.image ? (
							<Image
								src={user.image}
								alt="Avatar"
								width={48}
								height={48}
								className="h-full w-full object-cover"
							/>
						) : (
							<Image
								src="/assets/logo_circle_svg.svg"
								alt="Avatar"
								width={42}
								height={42}
								className="object-contain"
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
