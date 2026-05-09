"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import {
	AlertCircle,
	Camera,
	ChevronLeft,
	ChevronRight,
	QrCode,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { useAttendees } from "@/modules/attendees/hooks/use-attendees";
import {
	useCheckIns,
	useCreateCheckIn,
	useDeleteCheckIn,
} from "@/modules/check-ins/hooks/use-check-ins";
import { useValidatePass } from "@/modules/passes/hooks/use-passes";
import { Button } from "@/shared/ui/button";
import { useEvent } from "../hooks/use-events";

function TableRowSkeleton() {
	return (
		<tr>
			<td className="px-6 py-4">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
			</td>
			<td className="px-6 py-4">
				<div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
			</td>
			<td className="px-6 py-4">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
			</td>
			<td className="px-6 py-4">
				<div className="h-8 w-8 animate-pulse rounded bg-slate-100" />
			</td>
		</tr>
	);
}

const PAGE_SIZE = 50;

export function EventCheckInsView({ eventId }: { eventId: string }) {
	const [scannerMode, setScannerMode] = useState<"camera" | "manual">("camera");
	const [method, _setMethod] = useState<"ALL" | "QR_SCAN" | "MANUAL">("ALL");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	// Action states
	const [showScanner, setShowScanner] = useState(false);
	const [qrCode, setQrCode] = useState("");
	const [scannerKey, setScannerKey] = useState(0);
	const [cameraError, setCameraError] = useState("");
	const [qrError, setQrError] = useState("");
	const [qrSuccess, setQrSuccess] = useState(false);

	const _eventQuery = useEvent(eventId);
	const checkInsQuery = useCheckIns({
		page,
		limit: PAGE_SIZE,
		sortBy: "timestamp",
		sortOrder: "desc",
		eventId,
		...(method !== "ALL" ? { method } : {}),
	});

	const attendeesQuery = useAttendees({
		eventId,
		limit: 1000, // Load many for local mapping
	});

	const attendeeNameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const a of attendeesQuery.data?.data ?? []) {
			map.set(a.id, a.name);
		}
		return map;
	}, [attendeesQuery.data?.data]);

	const checkIns = checkInsQuery.data?.data ?? [];
	const meta = checkInsQuery.data?.meta;

	const stats = useMemo(() => {
		const total = meta?.total ?? 0;
		const qr = checkIns.filter((c) => c.method === "QR_SCAN").length;
		const manual = checkIns.filter((c) => c.method === "MANUAL").length;
		return { total, qr, manual };
	}, [checkIns, meta?.total]);

	const createCheckIn = useCreateCheckIn();
	const deleteCheckIn = useDeleteCheckIn();
	const validatePass = useValidatePass();
	const scannerId = useMemo(
		() => `event-checkins-scanner-${scannerKey}`,
		[scannerKey],
	);
	const isQrProcessing = validatePass.isPending || createCheckIn.isPending;

	const handleQrCheckIn = useCallback(
		async (rawCode?: string) => {
			const code = (rawCode ?? qrCode).trim();
			if (!code) return;

			setQrError("");
			setQrSuccess(false);
			try {
				const result = await validatePass.mutateAsync({
					code,
					eventId,
				});
				if (!result.valid || !result.pass) {
					setQrError(result.message || "Invalid or already used pass.");
					return;
				}

				await createCheckIn.mutateAsync({
					attendeeId: result.pass.attendeeId,
					eventId,
					method: "QR_SCAN",
				});

				setQrSuccess(true);
				setQrCode("");
				setTimeout(() => {
					setQrSuccess(false);
					setShowScanner(false);
				}, 1200);
			} catch (error) {
				setQrError(getApiErrorMessage(error, "Check-in failed"));
			}
		},
		[createCheckIn, eventId, qrCode, validatePass],
	);

	useEffect(() => {
		if (!showScanner || scannerMode !== "camera") {
			return;
		}

		let scanner: Html5QrcodeScanner | null = null;
		let isMounted = true;

		const timeoutId = setTimeout(() => {
			if (!isMounted) {
				return;
			}

			const scannerElement = document.getElementById(scannerId);
			if (!scannerElement) {
				setCameraError("Scanner did not initialize. Please try again.");
				return;
			}

			try {
				scanner = new Html5QrcodeScanner(
					scannerId,
					{ fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
					false,
				);

				scanner.render(
					(decodedText) => {
						if (!isMounted || isQrProcessing) {
							return;
						}
						void scanner?.clear().catch(() => {});
						setCameraError("");
						void handleQrCheckIn(decodedText);
					},
					() => {
						// Ignore non-match frames.
					},
				);
			} catch (error) {
				if (!isMounted) {
					return;
				}

				setCameraError(
					error instanceof Error
						? error.message
						: "Failed to access camera. Check browser permissions.",
				);
			}
		}, 100);

		return () => {
			isMounted = false;
			clearTimeout(timeoutId);
			if (scanner) {
				void scanner.clear().catch(() => {});
			}
		};
	}, [handleQrCheckIn, isQrProcessing, scannerId, scannerMode, showScanner]);

	const filteredCheckIns = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return checkIns;
		return checkIns.filter((c) => {
			const name = attendeeNameById.get(c.attendeeId) ?? "";
			return (
				name.toLowerCase().includes(q) || c.method.toLowerCase().includes(q)
			);
		});
	}, [checkIns, search, attendeeNameById]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-slate-900 text-xl tracking-tight">
						Check-ins
					</h2>
					<p className="text-slate-500 text-sm">
						Track entry and validate tickets for this event.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setShowScanner(true)}
						className="rounded-xl border-slate-200"
					>
						<QrCode className="mr-2 h-4 w-4" />
						QR Scan
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<StatCard label="Checked In" value={stats.total} color="emerald" />
				<StatCard label="QR Scans" value={stats.qr} color="blue" />
				<StatCard label="Manual" value={stats.manual} color="slate" />
				<div className="relative flex items-center">
					<Search className="absolute left-4 h-4 w-4 text-slate-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="text"
						placeholder="Search attendee..."
						className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#030370]"
					/>
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-slate-100 border-b bg-slate-50/50">
								<th className="px-6 py-4 font-bold text-slate-900">Attendee</th>
								<th className="px-6 py-4 font-bold text-slate-900">Method</th>
								<th className="px-6 py-4 font-bold text-slate-900">
									Timestamp
								</th>
								<th className="px-6 py-4 text-right font-bold text-slate-900">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{checkInsQuery.isLoading ? (
								<>
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
								</>
							) : filteredCheckIns.length === 0 ? (
								<tr>
									<td
										className="px-6 py-12 text-center text-slate-500"
										colSpan={4}
									>
										No check-ins recorded yet.
									</td>
								</tr>
							) : (
								filteredCheckIns.map((c) => (
									<tr
										key={c.id}
										className="transition-colors hover:bg-slate-50/50"
									>
										<td className="px-6 py-4 font-semibold text-slate-900">
											{attendeeNameById.get(c.attendeeId) || "Loading..."}
										</td>
										<td className="px-6 py-4">
											<span
												className={`rounded-full px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider ${
													c.method === "QR_SCAN"
														? "border border-blue-100 bg-blue-50 text-blue-600"
														: "border border-slate-100 bg-slate-50 text-slate-600"
												}`}
											>
												{c.method === "QR_SCAN" ? "QR Scan" : "Manual"}
											</span>
										</td>
										<td className="px-6 py-4 text-slate-500">
											{new Date(c.timestamp).toLocaleString("en-IN", {
												timeStyle: "short",
												dateStyle: "medium",
											})}
										</td>
										<td className="px-6 py-4 text-right">
											<button
												type="button"
												onClick={() => deleteCheckIn.mutate(c.id)}
												className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
											>
												<Trash2 size={16} />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{meta && meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-slate-100 border-t bg-slate-50/30 px-6 py-4">
						<p className="text-slate-500 text-xs">
							Showing{" "}
							<span className="font-bold text-slate-900">
								{(page - 1) * PAGE_SIZE + 1}
							</span>{" "}
							to{" "}
							<span className="font-bold text-slate-900">
								{Math.min(page * PAGE_SIZE, meta.total)}
							</span>{" "}
							check-ins
						</p>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setPage((p) => p - 1)}
								disabled={!meta.hasPreviousPage}
								className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
							>
								<ChevronLeft size={18} />
							</button>
							<span className="px-3 font-bold text-slate-900 text-xs">
								Page {page} of {meta.totalPages}
							</span>
							<button
								type="button"
								onClick={() => setPage((p) => p + 1)}
								disabled={!meta.hasNextPage}
								className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
							>
								<ChevronRight size={18} />
							</button>
						</div>
					</div>
				)}
			</div>

			{showScanner && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
						<div className="flex items-center justify-between border-slate-100 border-b px-6 py-5">
							<h3 className="font-black text-slate-900 text-xl tracking-tight">
								QR Check-in
							</h3>
							<button
								type="button"
								onClick={() => {
									setShowScanner(false);
									setQrCode("");
									setQrError("");
									setCameraError("");
									setQrSuccess(false);
								}}
								className="rounded-xl p-2 text-slate-400 hover:bg-slate-50"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="space-y-4 p-6">
							<div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
								<button
									type="button"
									onClick={() => {
										setScannerMode("camera");
										setCameraError("");
										setQrError("");
										setScannerKey((prev) => prev + 1);
									}}
									className={`rounded-lg px-3 py-2 font-semibold text-sm transition ${
										scannerMode === "camera"
											? "bg-[#030370] text-white"
											: "text-slate-700 hover:bg-white"
									}`}
								>
									<span className="inline-flex items-center gap-2">
										<Camera className="h-4 w-4" />
										Camera
									</span>
								</button>
								<button
									type="button"
									onClick={() => {
										setScannerMode("manual");
										setCameraError("");
									}}
									className={`rounded-lg px-3 py-2 font-semibold text-sm transition ${
										scannerMode === "manual"
											? "bg-[#030370] text-white"
											: "text-slate-700 hover:bg-white"
									}`}
								>
									Manual
								</button>
							</div>

							{scannerMode === "camera" && (
								<div className="space-y-3">
									{cameraError ? (
										<div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 text-sm">
											<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
											<p>{cameraError}</p>
										</div>
									) : (
										<div
											id={scannerId}
											className="min-h-65 overflow-hidden rounded-2xl border-2 border-slate-200 border-dashed"
										/>
									)}
									<p className="text-center text-slate-500 text-xs">
										Point camera at attendee QR pass
									</p>
								</div>
							)}

							{scannerMode === "manual" && (
								<div className="space-y-3">
									<input
										type="text"
										value={qrCode}
										onChange={(e) => setQrCode(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												void handleQrCheckIn();
											}
										}}
										placeholder="Enter pass code..."
										className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#030370]"
									/>
									<Button
										className="w-full rounded-xl bg-[#030370] py-6 font-black text-white uppercase tracking-widest hover:bg-[#030370]/90 disabled:opacity-50"
										onClick={() => void handleQrCheckIn()}
										disabled={!qrCode.trim() || isQrProcessing}
									>
										{isQrProcessing ? "Processing..." : "Validate & Check In"}
									</Button>
								</div>
							)}

							{qrError && (
								<div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 text-sm">
									<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
									<p>{qrError}</p>
								</div>
							)}

							{qrSuccess && (
								<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 font-medium text-emerald-800 text-sm">
									Check-in successful.
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function StatCard({
	label,
	value,
	color,
}: {
	label: string;
	value: number;
	color: "emerald" | "blue" | "slate";
}) {
	const colors = {
		emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
		blue: "text-blue-600 bg-blue-50 border-blue-100",
		slate: "text-slate-600 bg-slate-50 border-slate-100",
	};

	return (
		<div
			className={`rounded-2xl border bg-white p-4 shadow-sm ${colors[color].split(" ")[2]}`}
		>
			<p className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
				{label}
			</p>
			<p
				className={`mt-1 font-black text-2xl tracking-tight ${colors[color].split(" ")[0]}`}
			>
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}
