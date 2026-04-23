"use client";
import {
	Loader2,
	Monitor,
	Pencil,
	Smartphone,
	User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { authClient } from "@/core/lib/auth-client";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";
import { useUpdateMe } from "@/modules/auth/hooks/use-users";
import { usePayments } from "@/modules/payments";
import { useTickets } from "@/modules/tickets";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function ProfileView() {
	const { user, isLoading: isAuthLoading } = useAuth();
	const ticketsQuery = useTickets({ limit: 1 });
	const paymentsQuery = usePayments({ limit: 100, status: "SUCCESS" });

	const [sessions, setSessions] = useState<unknown[]>([]);
	const [isSessionsLoading, setIsSessionsLoading] = useState(true);

	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const response = await authClient.listSessions();
				if (response.data) setSessions(response.data);
			} catch (err) {
				console.error(err);
			} finally {
				setIsSessionsLoading(false);
			}
		};
		fetchSessions();
	}, []);

	if (isAuthLoading) {
		return (
			<div className="mx-auto max-w-4xl animate-pulse space-y-1">
				<div className="h-24 w-full rounded-none bg-slate-200" />
				<div className="h-96 w-full rounded-none bg-slate-200" />
				<div className="h-64 w-full rounded-none bg-slate-200" />
				<div className="h-64 w-full rounded-none bg-slate-200" />
			</div>
		);
	}

	if (!user) return null;

	const stats = {
		tickets: ticketsQuery.data?.meta.total ?? 0,
		spent:
			paymentsQuery.data?.data.reduce((acc, p) => acc + (p.amount ?? 0), 0) ??
			0,
		joined: "April 2024",
	};

	return (
		<div className="fade-in mx-auto max-w-4xl animate-in space-y-1 pb-20 duration-500">
			{/* Sharp Header */}
			<div className="border border-[#dbe7ff] bg-white p-6 sm:p-8">
				<span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">
					Identity Registry
				</span>
				<h1 className="mt-2 font-black text-2xl text-[#071a78] uppercase tracking-tighter sm:text-3xl">
					My Profile
				</h1>
				<p className="mt-2 max-w-xl font-bold text-slate-400 text-xs sm:text-sm">
					Manage your personal information, security credentials, and active
					operational sessions.
				</p>
			</div>

			<div className="space-y-1">
				{/* 1. Identity Hero - Sharp Layout */}
				<ProfileHeroCard user={user} stats={stats} />

				{/* 2. Personal Information Workspace */}
				<PersonalInfoCard user={user} />

				{/* 3. Operational Access Monitor */}
				<ActiveSessionsCard sessions={sessions} isLoading={isSessionsLoading} />
			</div>
		</div>
	);
}

function ProfileHeroCard({ user, stats }: { user: unknown; stats: unknown }) {
	const userRole =
		user &&
		typeof user === "object" &&
		"role" in user &&
		typeof user.role === "string"
			? user.role
			: "";
	const userName =
		user &&
		typeof user === "object" &&
		"name" in user &&
		typeof user.name === "string"
			? user.name
			: "";
	const userImage =
		user &&
		typeof user === "object" &&
		"image" in user &&
		typeof user.image === "string"
			? user.image
			: null;
	const userEmail =
		user &&
		typeof user === "object" &&
		"email" in user &&
		typeof user.email === "string"
			? user.email
			: "";
	const statsTickets =
		stats &&
		typeof stats === "object" &&
		"tickets" in stats &&
		typeof stats.tickets === "number"
			? stats.tickets
			: 0;
	const statsSpent =
		stats &&
		typeof stats === "object" &&
		"spent" in stats &&
		typeof stats.spent === "number"
			? stats.spent
			: 0;
	const statsJoined =
		stats &&
		typeof stats === "object" &&
		"joined" in stats &&
		typeof stats.joined === "string"
			? stats.joined
			: "";
	const _userEmailVerified =
		user &&
		typeof user === "object" &&
		"emailVerified" in user &&
		typeof user.emailVerified === "boolean"
			? user.emailVerified
			: false;

	return (
		<div className="relative border border-[#dbe7ff] bg-white">
			{/* Professional Sharp Banner */}
			<div className="relative h-40 overflow-hidden bg-[#030370]">
				<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
				<div className="absolute top-0 right-0 p-8">
					<Badge
						variant="outline"
						className="rounded-none border-white/20 bg-white/10 px-4 py-1.5 font-black text-[10px] text-white uppercase tracking-widest"
					>
						{userRole}
					</Badge>
				</div>
			</div>

			<div className="relative flex flex-col items-center gap-6 p-6 sm:gap-10 sm:p-10 md:flex-row">
				{/* Avatar - Sharp Border */}
				<div className="-mt-16 shrink-0 sm:-mt-20">
					<div className="flex h-32 w-32 items-center justify-center overflow-hidden border-4 border-white bg-white shadow-2xl sm:h-40 sm:w-40">
						{userImage ? (
							<Image
								src={userImage}
								alt={userName}
								width={160}
								height={160}
								className="h-full w-full object-cover"
							/>
						) : (
							<span className="font-black text-5xl text-[#030370]">
								{userName?.[0]?.toUpperCase() || userEmail[0].toUpperCase()}
							</span>
						)}
					</div>
				</div>

				<div className="flex-1 space-y-3 text-center md:text-left">
					<div className="space-y-1">
						<h2 className="font-black text-2xl text-slate-900 uppercase tracking-tighter sm:text-3xl">
							{userName || "Anonymous User"}
						</h2>
						<p className="font-medium text-slate-500 text-xs sm:text-sm">
							{userEmail}
						</p>
					</div>

					{/* Matrix Row - Sharp */}
					<div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 bg-[#f8fafc]">
						<div className="p-4">
							<p className="text-center font-black text-[#030370] text-[9px] uppercase tracking-widest opacity-60">
								Joined
							</p>
							<p className="mt-1 text-center font-black text-slate-700 text-xs">
								{statsJoined}
							</p>
						</div>
						<div className="p-4">
							<p className="text-center font-black text-[#030370] text-[9px] uppercase tracking-widest opacity-60">
								Spent
							</p>
							<p className="mt-1 text-center font-black text-slate-700 text-xs">
								₹{statsSpent}
							</p>
						</div>
						<div className="p-4">
							<p className="text-center font-black text-[#030370] text-[9px] uppercase tracking-widest opacity-60">
								Activity
							</p>
							<p className="mt-1 text-center font-black text-slate-700 text-xs">
								{statsTickets} Assets
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PersonalInfoCard({ user }: { user: unknown }) {
	const [isEditing, setIsEditing] = useState(false);
	const userName =
		user &&
		typeof user === "object" &&
		"name" in user &&
		typeof user.name === "string"
			? user.name
			: "";
	const userEmail =
		user &&
		typeof user === "object" &&
		"email" in user &&
		typeof user.email === "string"
			? user.email
			: "";
	const [name, setName] = useState(userName);
	const updateMe = useUpdateMe();

	const handleSave = async () => {
		if (!name.trim()) return;
		await updateMe.mutateAsync({ name: name.trim() });
		setIsEditing(false);
	};

	return (
		<div className="space-y-6 border border-[#dbe7ff] bg-white p-4 sm:p-8">
			<div className="flex flex-col justify-between gap-4 border-slate-100 border-b pb-6 sm:flex-row sm:items-center">
				<div className="flex items-center gap-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-900 text-white">
						<UserIcon size={20} />
					</div>
					<div>
						<h3 className="font-black text-[#030370] text-lg uppercase tracking-tight">
							Personal Info
						</h3>
						<p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">
							Your account identity
						</p>
					</div>
				</div>
				{!isEditing ? (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsEditing(true)}
						className="h-10 w-full gap-2 rounded-none border border-[#dbe7ff] px-4 font-black text-[#030370] text-[10px] uppercase tracking-widest hover:bg-slate-50 sm:w-auto"
					>
						<Pencil size={12} /> Edit Record
					</Button>
				) : (
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditing(false)}
							disabled={updateMe.isPending}
							className="h-10 rounded-none"
						>
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleSave}
							disabled={updateMe.isPending}
							className="h-10 rounded-none px-6 font-black text-[10px] uppercase tracking-widest"
						>
							Commit Changes
						</Button>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2">
				<div className="space-y-3">
					<label
						htmlFor="display-name"
						className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
					>
						Full Display Name
					</label>
					{isEditing ? (
						<Input
							id="display-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-11 rounded-none border-[#dbe7ff] px-4 font-bold text-xs focus:ring-[#030370] sm:h-12 sm:text-sm"
						/>
					) : (
						<div className="flex h-11 items-center border border-[#eff3ff] bg-[#f8fafc] px-4 font-bold text-slate-800 text-xs uppercase tracking-tight sm:h-12 sm:text-sm">
							{userName || "Not set"}
						</div>
					)}
				</div>
				<div className="space-y-3">
					<label
						htmlFor="email-display"
						className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"
					>
						Verified Endpoint
					</label>
					<div
						id="email-display"
						className="flex h-11 items-center justify-between border border-[#eff3ff] bg-[#f8fafc] px-4 opacity-60 sm:h-12"
					>
						<span className="mr-2 truncate font-bold text-slate-500 text-xs sm:text-sm">
							{userEmail}
						</span>
						<Badge
							variant="outline"
							className="shrink-0 rounded-none border-slate-200 font-black text-[8px] text-slate-400 uppercase tracking-widest"
						>
							LOCKED
						</Badge>
					</div>
				</div>
			</div>
		</div>
	);
}

function ActiveSessionsCard({
	sessions,
	isLoading,
}: {
	sessions: unknown[];
	isLoading: boolean;
}) {
	return (
		<div className="space-y-6 border border-[#dbe7ff] bg-white p-4 sm:p-8">
			<div className="flex items-center justify-between border-slate-100 border-b pb-6">
				<div className="flex items-center gap-4">
					<div className="flex h-10 w-10 items-center justify-center bg-slate-900 text-white">
						<Monitor size={20} />
					</div>
					<div>
						<h3 className="font-black text-[#030370] text-lg uppercase tracking-tight">
							Operational Access Monitor
						</h3>
						<p className="font-medium text-slate-400 text-xs">
							{sessions.length} Active Sessions
						</p>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-slate-400" />
				</div>
			) : sessions.length === 0 ? (
				<div className="py-12 text-center">
					<p className="font-medium text-slate-400 text-sm">
						No active sessions found
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{sessions.map((session, index) => {
						const sessionUserAgent =
							session &&
							typeof session === "object" &&
							"userAgent" in session &&
							typeof session.userAgent === "string"
								? session.userAgent
								: "";
						const sessionIpAddress =
							session &&
							typeof session === "object" &&
							"ipAddress" in session &&
							typeof session.ipAddress === "string"
								? session.ipAddress
								: "";
						const sessionCreatedAt =
							session &&
							typeof session === "object" &&
							"createdAt" in session &&
							typeof session.createdAt === "string"
								? session.createdAt
								: "";
						const isFirst = index === 0;

						return (
							<div
								key={index}
								className={cn(
									"flex flex-col justify-between gap-4 rounded-none border p-4 transition-all sm:flex-row sm:items-center",
									isFirst
										? "border-emerald-100 bg-emerald-50/30"
										: "border-[#eff3ff] bg-[#f8fafc]",
								)}
							>
								<div className="flex items-center gap-4 sm:gap-6">
									<div
										className={cn(
											"flex h-10 w-10 shrink-0 items-center justify-center border border-white",
											isFirst
												? "bg-white text-emerald-600 shadow-sm"
												: "bg-white text-slate-400",
										)}
									>
										<Smartphone size={20} />
									</div>
									<div className="min-w-0 space-y-0.5">
										<div className="flex flex-wrap items-center gap-2 sm:gap-3">
											<p className="truncate font-black text-slate-900 text-sm uppercase tracking-tight">
												{sessionUserAgent?.split(" ")[0] || "SYSTEM DEVICE"}
											</p>
											{isFirst && (
												<span className="whitespace-nowrap border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-black text-[8px] text-emerald-600 uppercase tracking-widest">
													ORIGIN SESSION
												</span>
											)}
										</div>
										<p className="truncate font-black text-[9px] text-slate-400 uppercase tracking-widest">
											Endpoint: {sessionIpAddress || "Unknown"}
										</p>
									</div>
								</div>
								<div className="border-slate-100 border-t pt-3 sm:border-none sm:pt-0 sm:text-right">
									<p className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
										Last Active
									</p>
									<p className="mt-0.5 font-medium text-slate-600 text-xs">
										{sessionCreatedAt
											? formatDate(sessionCreatedAt)
											: "Unknown"}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
