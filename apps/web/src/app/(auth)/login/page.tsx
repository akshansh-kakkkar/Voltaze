"use client";

import { Button } from "@voltaze/ui/components/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";

function LoginInner() {
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirect") || "/dashboard";
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogle = async () => {
		setIsLoading(true);
		try {
			const origin =
				typeof window !== "undefined" ? window.location.origin : "";
			const { error } = await authClient.signIn.social({
				provider: "google",
				callbackURL: redirectTo.startsWith("/")
					? `${origin}${redirectTo}`
					: redirectTo,
			});
			if (error) throw error;
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Sign-in failed";
			toast.error(message);
			setIsLoading(false);
		}
	};

	return (
		<main className="bg-muted">
			<div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-[100rem] flex-col justify-center px-6 py-20 md:flex-row md:items-stretch md:px-10">
				<div className="flex flex-1 flex-col justify-center bg-primary px-10 py-16 text-primary-foreground md:py-24 md:pr-20 lg:px-16">
					<p className="label-sm mb-6 text-primary-foreground/90">Access</p>
					<h1 className="display-lg max-w-[14ch]">Sign in to continue.</h1>
					<p className="body-md mt-8 max-w-md text-primary-foreground/85">
						Use Google to book tickets or manage your organization.
					</p>
				</div>

				<div className="flex flex-1 flex-col justify-center bg-card px-10 py-16 md:py-24 lg:px-16">
					<p className="label-sm mb-8">Google</p>
					<Button
						variant="outline"
						size="lg"
						className="w-full max-w-sm"
						disabled={isLoading}
						onClick={handleGoogle}
					>
						{isLoading ? "Connecting…" : "Continue with Google"}
					</Button>
					<Link
						href="/"
						className="label-sm mt-12 inline-block text-muted-foreground hover:text-primary"
					>
						← Back home
					</Link>
				</div>
			</div>
		</main>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<main className="flex min-h-[50vh] items-center justify-center bg-muted">
					<div className="h-2 w-32 animate-pulse bg-primary" />
				</main>
			}
		>
			<LoginInner />
		</Suspense>
	);
}
