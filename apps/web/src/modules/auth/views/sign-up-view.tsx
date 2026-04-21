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

export function SignUpView() {
	const router = useRouter();
	const { refresh } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name: name.trim() || email,
			});
			if (result.error) {
				setError(result.error.message ?? "Unable to create account.");
				return;
			}
			await refresh();
			router.push("/dashboard");
		} catch (err) {
			setError(getApiErrorMessage(err, "Unable to create account."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-md space-y-8">
			<SectionTitle
				eyebrow="Get started"
				title="Create your account"
				description="Join UniEvents to discover events, manage tickets, and more."
			/>

			<form onSubmit={handleSubmit} className="panel space-y-5 p-6 md:p-8">
				{error && (
					<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-sm text-[#c53030]">
						{error}
					</div>
				)}

				<label className="block space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Name
					</span>
					<Input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Your full name"
						autoComplete="name"
					/>
				</label>

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
						placeholder="Minimum 8 characters"
						required
						autoComplete="new-password"
						minLength={8}
					/>
				</label>

				<Button
					type="submit"
					className="w-full"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Creating account..." : "Create account"}
				</Button>

				<p className="text-center text-[#5f6984] text-sm">
					Already have an account?{" "}
					<Link
						href="/auth/sign-in"
						className="font-semibold text-[#0f3dd9] hover:underline"
					>
						Sign in
					</Link>
				</p>
			</form>
		</div>
	);
}
