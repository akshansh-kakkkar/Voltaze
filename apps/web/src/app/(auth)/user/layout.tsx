"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { UserSidebar } from "@/shared/ui/user-sidebar";

export default function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const mainRef = useRef<HTMLElement>(null);

	useEffect(() => {
		mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, [pathname]);

	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			<UserSidebar />
			{/* Main Content Area - scrollable on the right */}
			<main
				ref={mainRef}
				className="w-full pt-16 lg:fixed lg:top-16 lg:right-0 lg:bottom-0 lg:left-64 lg:w-auto lg:overflow-y-auto lg:overflow-x-hidden lg:pt-0"
			>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-[#d7e8ff]/70 via-[#e9f2ff]/35 to-transparent"
				/>
				<div className="relative px-4 pt-14 pb-6 sm:px-6 sm:pt-6 md:px-8 md:pt-3 md:pb-8">
					{children}
				</div>
			</main>
		</div>
	);
}
