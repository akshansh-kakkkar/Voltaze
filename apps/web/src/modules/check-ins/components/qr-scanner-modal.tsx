"use client";

import { Html5Qrcode } from "html5-qrcode";
import {
	AlertCircle,
	Camera,
	CheckCircle2,
	ChevronRight,
	Keyboard,
	Loader2,
	RefreshCw,
	ScanLine,
	Sparkles,
	UserCheck,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ScannerMode = "camera" | "manual";
type ScanStatus =
	| "idle"
	| "processing"
	| "success"
	| "already_checked_in"
	| "error";

export type QRScanResult = {
	attendeeName?: string;
	alreadyIn?: boolean;
	errorMsg?: string;
};

type QRScannerModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onScan: (code: string) => Promise<QRScanResult>;
	eventOptions: Array<{ id: string; name: string }>;
	selectedEventId: string;
	onEventChange: (eventId: string) => void;
};

const SCANNER_ID = "qr-reader-v2";

export function QRScannerModal({
	isOpen,
	onClose,
	onScan,
	eventOptions,
	selectedEventId,
	onEventChange,
}: QRScannerModalProps) {
	const [mode, setMode] = useState<ScannerMode>("camera");
	const [manualCode, setManualCode] = useState("");

	const [cameraState, setCameraState] = useState<
		"idle" | "starting" | "live" | "error"
	>("idle");
	const [cameraErrorMsg, setCameraErrorMsg] = useState("");

	const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
	const [resultName, setResultName] = useState("");
	const [resultError, setResultError] = useState("");

	const scannerRef = useRef<Html5Qrcode | null>(null);
	const scanLockRef = useRef(false);
	const startIdRef = useRef(0);

	// ── camera control ─────────────────────────────────────────────────
	const stopCamera = useCallback(async () => {
		const s = scannerRef.current;
		scannerRef.current = null;
		setCameraState((prev) =>
			prev === "live" || prev === "starting" ? "idle" : prev,
		);
		if (!s) return;
		try {
			await s.stop();
		} catch {
			/* ignore */
		}
		try {
			await s.clear();
		} catch {
			/* ignore */
		}
	}, []);

	const startCamera = useCallback(async () => {
		if (!selectedEventId) return;
		if (scannerRef.current || scanLockRef.current) return;

		const myId = ++startIdRef.current;
		setCameraState("starting");
		setCameraErrorMsg("");

		// Ensure the DOM element exists before proceeding
		await new Promise<void>((resolve) => setTimeout(resolve, 60));
		const el = document.getElementById(SCANNER_ID);
		if (!el || startIdRef.current !== myId) return;

		try {
			const scanner = new Html5Qrcode(SCANNER_ID, { verbose: false });
			scannerRef.current = scanner;

			await scanner.start(
				{ facingMode: "environment" },
				{ fps: 8, qrbox: { width: 200, height: 200 } },
				async (decoded) => {
					if (startIdRef.current !== myId || scanLockRef.current) return;
					scanLockRef.current = true; // hard lock — first decode only
					await stopCamera();
					setScanStatus("processing");
					try {
						const res = await onScan(decoded);
						if (res.alreadyIn) {
							setResultName(res.attendeeName ?? "");
							setScanStatus("already_checked_in");
						} else if (res.errorMsg) {
							setResultError(res.errorMsg);
							setScanStatus("error");
						} else {
							setResultName(res.attendeeName ?? "");
							setScanStatus("success");
						}
					} catch {
						setResultError("Unexpected error. Please try again.");
						setScanStatus("error");
					}
				},
				() => {
					/* scan miss — ignore */
				},
			);

			if (startIdRef.current === myId) setCameraState("live");
		} catch (err) {
			if (startIdRef.current === myId) {
				await stopCamera();
				setCameraState("error");
				setCameraErrorMsg(
					err instanceof Error
						? err.message
						: "Could not access camera. Check permissions.",
				);
			}
		}
	}, [selectedEventId, onScan, stopCamera]);

	const resetScan = useCallback(() => {
		setScanStatus("idle");
		setResultName("");
		setResultError("");
		setManualCode("");
		scanLockRef.current = false;
	}, []);

	const handleScanAnother = useCallback(async () => {
		resetScan();
		if (mode === "camera") {
			await stopCamera();
			void startCamera();
		}
	}, [resetScan, mode, stopCamera, startCamera]);

	const handleManualSubmit = useCallback(async () => {
		const value = manualCode.trim();
		if (!value || scanStatus === "processing") return;

		resetScan();
		setScanStatus("processing");

		try {
			const res = await onScan(value);
			setManualCode("");
			if (res.alreadyIn) {
				setResultName(res.attendeeName ?? "");
				setScanStatus("already_checked_in");
			} else if (res.errorMsg) {
				setResultError(res.errorMsg);
				setScanStatus("error");
			} else {
				setResultName(res.attendeeName ?? "");
				setScanStatus("success");
			}
		} catch {
			setResultError("Unexpected error. Please try again.");
			setScanStatus("error");
		}
	}, [manualCode, onScan, resetScan, scanStatus]);

	// Stop camera when modal closes or event is deselected
	useEffect(() => {
		if (!isOpen || !selectedEventId) {
			void stopCamera();
			resetScan();
			setCameraErrorMsg("");
		}
	}, [isOpen, selectedEventId, stopCamera, resetScan]);

	// Stop camera when switching to manual
	useEffect(() => {
		if (mode === "manual") void stopCamera();
	}, [mode, stopCamera]);

	if (!isOpen) return null;

	const isProcessing = scanStatus === "processing";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
			{/* ── SUCCESS overlay ── */}
			{scanStatus === "success" && (
				<div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
					<div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-10 text-center text-white">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
							<CheckCircle2 className="h-10 w-10" />
						</div>
						<h2 className="font-black text-2xl tracking-tight">Checked In!</h2>
						{resultName ? (
							<p className="mt-2 font-bold text-emerald-100 text-xl">
								{resultName}
							</p>
						) : null}
						<p className="mt-1 text-emerald-200 text-sm">
							Successfully checked in to the event.
						</p>
					</div>
					<div className="flex flex-col gap-3 p-6">
						<button
							type="button"
							onClick={() => void handleScanAnother()}
							className="flex items-center justify-center gap-2 rounded-2xl bg-[#030370] px-6 py-3.5 font-black text-white shadow-[0_8px_24px_rgba(3,3,112,0.22)] transition hover:bg-[#0a4bb8]"
						>
							<ScanLine className="h-4 w-4" />
							Scan Next Attendee
						</button>
						<button
							type="button"
							onClick={onClose}
							className="rounded-2xl border border-slate-200 px-6 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-50"
						>
							Done
						</button>
					</div>
				</div>
			)}

			{/* ── ALREADY CHECKED IN overlay ── */}
			{scanStatus === "already_checked_in" && (
				<div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
					<div className="bg-gradient-to-br from-amber-400 to-orange-500 px-8 py-10 text-center text-white">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
							<UserCheck className="h-10 w-10" />
						</div>
						<h2 className="font-black text-2xl tracking-tight">
							Already Checked In
						</h2>
						{resultName ? (
							<p className="mt-2 font-bold text-amber-100 text-xl">
								{resultName}
							</p>
						) : null}
						<p className="mt-1 text-amber-200 text-sm">
							This attendee has already been checked in for this event.
						</p>
					</div>
					<div className="flex flex-col gap-3 p-6">
						<button
							type="button"
							onClick={() => void handleScanAnother()}
							className="flex items-center justify-center gap-2 rounded-2xl bg-[#030370] px-6 py-3.5 font-black text-white shadow-[0_8px_24px_rgba(3,3,112,0.22)] transition hover:bg-[#0a4bb8]"
						>
							<ScanLine className="h-4 w-4" />
							Scan Next Attendee
						</button>
						<button
							type="button"
							onClick={onClose}
							className="rounded-2xl border border-slate-200 px-6 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-50"
						>
							Done
						</button>
					</div>
				</div>
			)}

			{/* ── ERROR overlay ── */}
			{scanStatus === "error" && (
				<div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
					<div className="bg-gradient-to-br from-rose-500 to-red-600 px-8 py-10 text-center text-white">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
							<AlertCircle className="h-10 w-10" />
						</div>
						<h2 className="font-black text-2xl tracking-tight">
							Check-in Failed
						</h2>
						<p className="mt-2 text-rose-100 text-sm leading-relaxed">
							{resultError || "This pass could not be validated."}
						</p>
					</div>
					<div className="flex flex-col gap-3 p-6">
						<button
							type="button"
							onClick={() => void handleScanAnother()}
							className="flex items-center justify-center gap-2 rounded-2xl bg-[#030370] px-6 py-3.5 font-black text-white shadow-[0_8px_24px_rgba(3,3,112,0.22)] transition hover:bg-[#0a4bb8]"
						>
							<RefreshCw className="h-4 w-4" />
							Try Again
						</button>
						<button
							type="button"
							onClick={onClose}
							className="rounded-2xl border border-slate-200 px-6 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-50"
						>
							Close
						</button>
					</div>
				</div>
			)}

			{/* ── MAIN SCANNER modal ── hidden (not unmounted) during result screens */}
			<div
				className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-[0_32px_80px_rgba(2,6,23,0.28)]"
				style={{
					display:
						scanStatus === "idle" || scanStatus === "processing"
							? "block"
							: "none",
				}}
			>
				{/* Header */}
				<div className="flex items-start justify-between gap-4 border-slate-100 border-b px-6 py-5">
					<div>
						<div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#dbe7ff] bg-[#f3f8ff] px-3 py-1 font-bold text-[#0a4bb8] text-xs uppercase tracking-wider">
							<Sparkles className="h-3 w-3" />
							QR Check-in
						</div>
						<h2 className="font-black text-slate-900 text-xl tracking-tight">
							Scan Attendee Pass
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="space-y-4 p-5">
					{/* Event selector */}
					<div>
						<label
							htmlFor="scanner-event-v2"
							className="mb-1.5 block font-semibold text-slate-700 text-sm"
						>
							Event
						</label>
						<select
							id="scanner-event-v2"
							value={selectedEventId}
							onChange={(e) => {
								onEventChange(e.target.value);
								resetScan();
								void stopCamera();
								setCameraErrorMsg("");
								setCameraState("idle");
							}}
							className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
						>
							<option value="">Select event…</option>
							{eventOptions.map((ev) => (
								<option key={ev.id} value={ev.id}>
									{ev.name}
								</option>
							))}
						</select>
					</div>

					{selectedEventId && (
						<>
							{/* Mode toggle */}
							<div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
								{(["camera", "manual"] as const).map((m) => (
									<button
										key={m}
										type="button"
										onClick={() => {
											setMode(m);
											resetScan();
										}}
										className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all ${
											mode === m
												? "bg-[#030370] text-white shadow-[0_6px_18px_rgba(3,3,112,0.22)]"
												: "text-slate-600 hover:bg-white"
										}`}
									>
										{m === "camera" ? (
											<Camera className="h-4 w-4" />
										) : (
											<Keyboard className="h-4 w-4" />
										)}
										{m === "camera" ? "Camera" : "Manual"}
									</button>
								))}
							</div>

							{/* ── CAMERA VIEWPORT: ALWAYS IN DOM — only hidden via CSS ── */}
							<div
								style={{ display: mode === "camera" ? "block" : "none" }}
								className="space-y-3"
							>
								<div
									className="relative overflow-hidden rounded-2xl bg-black"
									style={{ aspectRatio: "1/1" }}
								>
									{/* Html5Qrcode mounts here — never conditionally removed */}
									<div id={SCANNER_ID} className="h-full w-full" />

									{/* IDLE state overlay */}
									{cameraState === "idle" && !isProcessing && (
										<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900">
											<div className="text-center">
												<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
													<Camera className="h-8 w-8 text-white/60" />
												</div>
												<p className="font-semibold text-sm text-white/80">
													Camera not started
												</p>
												<p className="mt-1 text-white/40 text-xs">
													Press Start Camera below
												</p>
											</div>
										</div>
									)}

									{/* STARTING overlay */}
									{cameraState === "starting" && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm">
											<div className="rounded-2xl bg-white/10 px-6 py-5 text-center">
												<Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-white" />
												<p className="font-semibold text-sm text-white">
													Starting camera…
												</p>
												<p className="mt-0.5 text-white/60 text-xs">
													Allow access when prompted
												</p>
											</div>
										</div>
									)}

									{/* PROCESSING overlay */}
									{isProcessing && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
											<div className="rounded-2xl bg-white/10 px-6 py-5 text-center">
												<Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-white" />
												<p className="font-semibold text-sm text-white">
													Validating pass…
												</p>
											</div>
										</div>
									)}

									{/* LIVE indicator + target box */}
									{cameraState === "live" && !isProcessing && (
										<>
											<div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 shadow-lg">
												<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
												<span className="font-bold text-white text-xs">
													LIVE
												</span>
											</div>
											<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
												<div className="h-44 w-44 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
											</div>
										</>
									)}
								</div>

								{/* Camera error */}
								{cameraState === "error" && (
									<div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
										<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
										<div className="min-w-0 flex-1">
											<p className="font-semibold text-rose-900 text-sm">
												Camera error
											</p>
											<p className="mt-0.5 text-rose-700 text-xs leading-5">
												{cameraErrorMsg}
											</p>
										</div>
									</div>
								)}

								{/* Camera buttons */}
								<div className="grid grid-cols-2 gap-2">
									<button
										type="button"
										onClick={() => {
											setMode("manual");
											resetScan();
										}}
										className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 text-sm transition hover:bg-slate-50"
									>
										<Keyboard className="h-4 w-4" />
										Manual entry
									</button>
									<button
										type="button"
										disabled={cameraState === "starting" || isProcessing}
										onClick={() => {
											if (cameraState === "live") {
												void stopCamera().then(() => {
													setCameraState("idle");
													void startCamera();
												});
											} else {
												void startCamera();
											}
										}}
										className="flex items-center justify-center gap-2 rounded-xl bg-[#030370] px-4 py-3 font-bold text-sm text-white shadow-[0_6px_18px_rgba(3,3,112,0.2)] transition hover:bg-[#0a4bb8] disabled:opacity-50"
									>
										{cameraState === "starting" ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" /> Starting…
											</>
										) : cameraState === "live" ? (
											<>
												<RefreshCw className="h-4 w-4" /> Restart
											</>
										) : (
											<>
												<Camera className="h-4 w-4" /> Start Camera
											</>
										)}
									</button>
								</div>
							</div>

							{/* Manual mode */}
							{mode === "manual" && (
								<div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
									<div>
										<label
											htmlFor="manual-pass-v2"
											className="mb-1.5 block font-semibold text-slate-700 text-sm"
										>
											Pass Code
										</label>
										<input
											id="manual-pass-v2"
											type="text"
											value={manualCode}
											onChange={(e) => setManualCode(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" && manualCode.trim())
													void handleManualSubmit();
											}}
											placeholder="Paste or type pass code…"
											disabled={isProcessing}
											className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4bb8] disabled:opacity-50"
										/>
										<p className="mt-1.5 text-slate-400 text-xs">
											Enter the code shown on the attendee's pass (e.g.
											pv_xxxx…)
										</p>
									</div>
									<div className="grid grid-cols-2 gap-2">
										<button
											type="button"
											onClick={() => {
												setMode("camera");
												resetScan();
											}}
											className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 text-sm transition hover:bg-slate-50"
										>
											<Camera className="h-4 w-4" />
											Use camera
										</button>
										<button
											type="button"
											onClick={() => void handleManualSubmit()}
											disabled={!manualCode.trim() || isProcessing}
											className="flex items-center justify-center gap-2 rounded-xl bg-[#030370] px-4 py-3 font-bold text-sm text-white shadow-[0_6px_18px_rgba(3,3,112,0.2)] transition hover:bg-[#0a4bb8] disabled:opacity-50"
										>
											{isProcessing ? (
												<>
													<Loader2 className="h-4 w-4 animate-spin" /> Checking…
												</>
											) : (
												<>
													<ChevronRight className="h-4 w-4" /> Check In
												</>
											)}
										</button>
									</div>
								</div>
							)}
						</>
					)}
				</div>

				<div className="flex justify-end border-slate-100 border-t px-5 py-4">
					<button
						type="button"
						onClick={onClose}
						className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 text-sm transition hover:bg-slate-50"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
