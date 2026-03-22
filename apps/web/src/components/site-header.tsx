"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";

const linkClass =
	"label-sm text-foreground/80 transition-colors hover:text-primary";

export function SiteHeader() {
	const pathname = usePathname();
	const { data: session, isPending } = authClient.useSession();

	return (
		<header className="glass-nav sticky top-0 z-50">
			<div className="mx-auto flex max-w-[100rem] items-end justify-between gap-12 px-6 py-6 md:px-10 md:py-8">
				<Link
					href="/"
					className="font-bold font-heading text-2xl text-foreground tracking-tight md:text-3xl"
				>
					VOLTAZE
				</Link>

				<nav className="flex flex-wrap items-center justify-end gap-x-10 gap-y-3">
					<Link href="/events" className={linkClass}>
						Events
					</Link>
					{session ? (
						<>
							<Link href="/tickets" className={linkClass}>
								My tickets
							</Link>
							<Link href="/dashboard" className={linkClass}>
								Dashboard
							</Link>
						</>
					) : !isPending ? (
						<Link
							href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}
							className={linkClass}
						>
							Sign in
						</Link>
					) : null}
				</nav>
			</div>
		</header>
	);
}
