"use client";

import { cn } from "@voltaze/ui/lib/utils";
import { Calendar, LayoutDashboard, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useListOrgs } from "@/lib/api/hooks";
import { authClient } from "@/lib/auth/client";

const NAV = [
	{ label: "Overview", href: "/dashboard", icon: LayoutDashboard },
	{ label: "New event", href: "/dashboard/events/new", icon: PlusCircle },
] as const;

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const { data: orgs } = useListOrgs();
	const orgName = orgs?.[0]?.name ?? "Organization";

	useEffect(() => {
		if (!isPending && !session) router.push("/login");
	}, [session, isPending, router]);

	if (isPending) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center bg-muted">
				<div className="h-2 w-32 animate-pulse bg-primary" />
			</div>
		);
	}

	if (!session) return null;

	return (
		<div className="flex min-h-[calc(100svh-5rem)] bg-background">
			<aside className="hidden w-64 flex-shrink-0 flex-col bg-muted md:flex">
				<div className="px-8 py-10">
					<p className="label-sm mb-2 text-muted-foreground">Org</p>
					<p className="font-bold font-heading text-lg leading-tight">
						{orgName}
					</p>
				</div>
				<nav className="flex flex-col gap-1 px-4 pb-8">
					{NAV.map(({ label, href, icon: Icon }) => {
						const active = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								className={cn(
									"flex items-center gap-3 px-4 py-4 font-medium text-sm uppercase tracking-widest transition-colors",
									active
										? "bg-card text-primary"
										: "text-muted-foreground hover:bg-secondary hover:text-foreground",
								)}
							>
								<Icon className="h-4 w-4" />
								{label}
							</Link>
						);
					})}
					<Link
						href="/events"
						className="flex items-center gap-3 px-4 py-4 font-medium text-muted-foreground text-sm uppercase tracking-widest transition-colors hover:bg-secondary hover:text-foreground"
					>
						<Calendar className="h-4 w-4" />
						Public site
					</Link>
				</nav>
			</aside>

			<div className="flex flex-1 flex-col bg-background">
				<div className="bg-secondary px-6 py-4 md:hidden">
					<p className="font-bold font-heading text-sm">{orgName}</p>
					<div className="mt-4 flex gap-4">
						{NAV.map(({ label, href }) => (
							<Link
								key={href}
								href={href}
								className={cn(
									"font-semibold text-xs uppercase tracking-wider",
									pathname === href ? "text-primary" : "text-muted-foreground",
								)}
							>
								{label}
							</Link>
						))}
					</div>
				</div>
				<div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 md:py-14">
					<div className="mx-auto max-w-4xl">{children}</div>
				</div>
			</div>
		</div>
	);
}
