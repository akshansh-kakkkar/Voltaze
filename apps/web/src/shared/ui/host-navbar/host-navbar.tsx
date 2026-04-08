"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import { useCurrentUser } from "@/features/auth";

interface HostNavbarProps {
	title?: string;
	breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function HostNavbar({ title, breadcrumbs }: HostNavbarProps) {
	const { data: user } = useCurrentUser();
	const safeName = user?.name?.trim() || "Host";
	const effectiveTitle = title?.trim() || `Hey ${safeName}`;

	return (
		<nav className="fixed top-0 right-0 left-64 z-30 flex h-20 items-center justify-between border-[#dbe7ff] border-b bg-white/80 px-8 backdrop-blur-md">
			{/* Left Section - Title/Breadcrumbs */}
			<div className="min-w-0 flex-1">
				{breadcrumbs && !title ? (
					<div className="flex items-center gap-2 truncate text-[#4f6ea8] text-sm">
						{breadcrumbs.map((item, idx) => (
							<div key={idx} className="flex min-w-0 items-center gap-2">
								{idx > 0 && <span className="text-slate-300">/</span>}
								<span className="truncate">{item.label}</span>
							</div>
						))}
					</div>
				) : (
					<div className="min-w-0">
						<p className="font-semibold text-[#030370]/60 text-xs uppercase tracking-wide">
							Host Dashboard
						</p>
						<h1 className="truncate font-bold text-2xl text-[#071a78]">
							{effectiveTitle}
						</h1>
					</div>
				)}
			</div>

			{/* Right Section - Notifications & Profile */}
			<div className="flex items-center gap-6">
				{/* Notifications */}
				<button
					type="button"
					className="relative rounded-lg p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
				>
					<Bell className="h-5 w-5" />
					<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
				</button>

				{/* Profile Info */}
				<div className="flex items-center gap-3 border-[#dbe7ff] border-l pl-6">
					{user?.image && (
						<div className="h-10 w-10 overflow-hidden rounded-full bg-violet-100">
							<Image
								src={user.image}
								alt={user.name || "User"}
								width={40}
								height={40}
								className="h-full w-full object-cover"
							/>
						</div>
					)}
					{!user?.image && (
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#0a4bb8] to-[#245ed1] font-semibold text-sm text-white shadow-sm">
							{user?.name?.charAt(0).toUpperCase() || "U"}
						</div>
					)}
					<div className="hidden sm:block">
						<p className="max-w-45 truncate font-medium text-slate-900 text-sm">
							{user?.name}
						</p>
						<p className="max-w-45 truncate text-slate-500 text-xs">
							{user?.email}
						</p>
					</div>
				</div>
			</div>
		</nav>
	);
}
