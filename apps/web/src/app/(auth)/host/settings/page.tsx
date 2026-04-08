"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import { useCurrentUser, useLogout } from "@/features/auth";

export default function HostSettingsPage() {
	const { data: user, isLoading } = useCurrentUser();
	const logoutMutation = useLogout();

	return (
		<div className="max-w-2xl space-y-6">
			<div>
				<h1 className="font-bold text-2xl text-slate-900">Settings</h1>
				<p className="mt-1 text-slate-600">
					Manage your account. Additional settings will appear as backend
					endpoints are added.
				</p>
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white p-6">
				<div className="flex items-center gap-4">
					{user?.image ? (
						<div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
							<Image
								src={user.image}
								alt={user.name || "User"}
								width={48}
								height={48}
								className="h-full w-full object-cover"
							/>
						</div>
					) : (
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#030370] font-bold text-white">
							{(user?.name?.trim() || user?.email?.trim() || "U")
								.charAt(0)
								.toUpperCase()}
						</div>
					)}

					<div className="min-w-0">
						<p className="truncate font-semibold text-slate-900">
							{isLoading ? "Loading..." : user?.name || "—"}
						</p>
						<p className="truncate text-slate-500 text-sm">
							{user?.email || "—"}
						</p>
					</div>
				</div>

				<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<InfoField label="User ID" value={user?.id} />
					<InfoField
						label="Role"
						value={(user as unknown as { role?: string })?.role}
					/>
				</div>
			</div>

			<button
				type="button"
				onClick={() => logoutMutation.mutate()}
				disabled={logoutMutation.isPending}
				className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
			>
				<LogOut className="h-5 w-5" />
				{logoutMutation.isPending ? "Logging out..." : "Logout"}
			</button>
		</div>
	);
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
			<p className="font-semibold text-slate-500 text-xs uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-1 break-all font-semibold text-slate-900 text-sm">
				{value || "—"}
			</p>
		</div>
	);
}
