"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/core/lib/auth-client";
import { useAuth } from "@/core/providers/auth-provider";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SectionTitle } from "@/shared/ui/section-title";
import { getApiErrorMessage } from "@/core/lib/api-error";

export function SignInView() {
	const router = useRouter();
	const { refresh } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				setError(result.error.message ?? "Invalid credentials.");
				return;
			}
			await refresh();
			router.push("/dashboard");
		} catch (err) {
			setError(getApiErrorMessage(err, "Unable to sign in."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-md space-y-8">
			<SectionTitle
				eyebrow="Welcome back"
				title="Sign in to UniEvents"
				description="Enter your credentials to access the platform."
			/>

			<form onSubmit={handleSubmit} className="panel space-y-5 p-6 md:p-8">
				{error && (
					<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-sm text-[#c53030]">
						{error}
					</div>
				)}

				<label className="block space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Email
					</span>
					<Input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@university.edu"
						required
						autoComplete="email"
					/>
				</label>

				<label className="block space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Password
					</span>
					<Input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
						required
						autoComplete="current-password"
						minLength={8}
					/>
				</label>

				<Button
					type="submit"
					className="w-full"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Signing in..." : "Sign in"}
				</Button>

				<p className="text-center text-[#5f6984] text-sm">
					No account yet?{" "}
					<Link
						href="/auth/sign-up"
						className="font-semibold text-[#0f3dd9] hover:underline"
					>
						Create one
					</Link>
				</p>
			</form>
		</div>
	);
}
