"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navigation, managementNavigation } from "@/core/config/navigation";
import { useAuth } from "@/core/providers/auth-provider";
import { useUnreadCount } from "@/modules/notifications";
import { Button } from "@/shared/ui/button";
import { cn } from "@/core/lib/cn";

export function AppShell({ children }: { children: React.ReactNode }) {
	const { user, isAuthenticated, isLoading } = useAuth();
	const unreadQuery = useUnreadCount({ enabled: isAuthenticated });
	const unreadCount = unreadQuery.data?.count ?? 0;
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div className="relative min-h-screen overflow-x-clip">
			<div className="grid-fabric pointer-events-none absolute inset-0" />
			<header className="sticky top-0 z-40 border-[#d8e2fd] border-b bg-white/88 backdrop-blur-xl">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
					<Link href="/" className="flex items-center gap-3">
						<Image
							src="/assets/logo_circle.png"
							alt="UniEvents logo"
							width={40}
							height={40}
							className="rounded-full"
						/>
						<div>
							<p className="display-font font-bold text-xl">UniEvents</p>
							<p className="text-[#5f6984] text-xs">Campus Event Platform</p>
						</div>
					</Link>

					<nav className="hidden items-center gap-1 lg:flex">
						{navigation
							.filter(item => !item.roles || item.roles.includes((user?.role as any) ?? "USER"))
							.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"rounded-full px-4 py-2 font-medium text-sm transition-colors",
										"text-[#273054] hover:bg-[#dce6ff]",
									)}
								>
									{item.label}
								</Link>
							))}

						{isAuthenticated && (
							<>
								<span className="mx-1 h-5 w-px bg-[#d6def4]" />
								{managementNavigation
									.filter(item => !item.roles || item.roles.includes((user?.role as any) ?? "USER"))
									.map((item) => (
										<Link
											key={item.href}
											href={item.href}
											className={cn(
												"rounded-full px-3 py-2 font-medium text-sm transition-colors",
												"text-[#5f6984] hover:bg-[#dce6ff] hover:text-[#273054]",
												item.href === "/notifications" && unreadCount > 0 && "relative",
											)}
										>
											{item.label}
										{item.href === "/notifications" && unreadCount > 0 && (
											<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0f3dd9] font-bold text-[10px] text-white">
												{unreadCount > 9 ? "9+" : unreadCount}
											</span>
										)}
									</Link>
								))}
							</>
						)}
					</nav>

					<div className="flex items-center gap-3">
						{isLoading ? (
							<div className="h-9 w-20 animate-pulse rounded-xl bg-[#e4ecfd]" />
						) : isAuthenticated ? (
							<Link
								href="/profile"
								className="flex items-center gap-2 rounded-full border border-[#d4def8] bg-white px-3 py-1.5 font-medium text-sm text-[#1b2440] transition-colors hover:bg-[#f4f7ff]"
							>
								{user?.image ? (
									<img
										src={user.image}
										alt=""
										className="h-6 w-6 rounded-full object-cover"
									/>
								) : (
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#1264db] to-[#0e43b9] font-bold text-[10px] text-white">
										{(user?.name ?? user?.email ?? "U")[0]?.toUpperCase()}
									</span>
								)}
								<span className="hidden sm:inline">
									{user?.name ?? "Profile"}
								</span>
							</Link>
						) : (
							<Button asChild size="sm">
								<Link href="/auth/sign-in">Sign in</Link>
							</Button>
						)}

						<button
							type="button"
							onClick={() => setMobileOpen(!mobileOpen)}
							className="rounded-lg p-2 text-[#273054] transition-colors hover:bg-[#dce6ff] lg:hidden"
							aria-label="Toggle menu"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							>
								{mobileOpen ? (
									<>
										<line x1="4" y1="4" x2="16" y2="16" />
										<line x1="16" y1="4" x2="4" y2="16" />
									</>
								) : (
									<>
										<line x1="3" y1="5" x2="17" y2="5" />
										<line x1="3" y1="10" x2="17" y2="10" />
										<line x1="3" y1="15" x2="17" y2="15" />
									</>
								)}
							</svg>
						</button>
					</div>
				</div>

				{mobileOpen && (
					<div className="border-[#d8e2fd] border-t bg-white px-4 py-4 lg:hidden">
						<nav className="flex flex-col gap-1">
							{navigation
								.filter(item => !item.roles || item.roles.includes((user?.role as any) ?? "USER"))
								.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setMobileOpen(false)}
										className="rounded-xl px-4 py-2.5 font-medium text-sm text-[#273054] transition-colors hover:bg-[#dce6ff]"
									>
										{item.label}
									</Link>
								))}
							{isAuthenticated &&
								managementNavigation
									.filter(item => !item.roles || item.roles.includes((user?.role as any) ?? "USER"))
									.map((item) => (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setMobileOpen(false)}
											className="rounded-xl px-4 py-2.5 font-medium text-sm text-[#5f6984] transition-colors hover:bg-[#dce6ff]"
										>
											{item.label}
										{item.href === "/notifications" && unreadCount > 0 && (
											<span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0f3dd9] font-bold text-[10px] text-white">
												{unreadCount > 9 ? "9+" : unreadCount}
											</span>
										)}
									</Link>
								))}
						</nav>
					</div>
				)}
			</header>

			<main className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
				{children}
			</main>

			<footer className="mx-auto mt-8 w-full max-w-6xl px-4 pb-10 md:px-8">
				<div className="panel-soft flex flex-col gap-2 px-5 py-4 text-sm text-[#4f5a78] md:flex-row md:items-center md:justify-between">
					<p>Discover events, manage passes, and monitor readiness in one place.</p>
					<p className="font-semibold text-[#1e2b4f]">Updated April 2026</p>
				</div>
			</footer>
		</div>
	);
}
