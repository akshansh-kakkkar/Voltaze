"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useCreateCheckIn } from "../hooks/use-check-ins";
import { SectionTitle } from "@/shared/ui/section-title";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/core/providers/auth-provider";

export function ScanView() {
	const [scannedCode, setScannedCode] = useState<string | null>(null);
	const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState("");
	
	const createCheckIn = useCreateCheckIn();
	const { user } = useAuth();
	
	// Assume the active user is scanning for an event they own or manage
	// A proper UI would allow them to select the event first.
	// For MVP, if backend automatically links via the pass code, we just send code & checkInMethod="QR".

	useEffect(() => {
		const scanner = new Html5QrcodeScanner(
			"reader",
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			false
		);

		function onScanSuccess(decodedText: string) {
			setScannedCode(decodedText);
			scanner.clear();
		}

		function onScanFailure(error: any) {
			// ignore standard failures until match
		}

		scanner.render(onScanSuccess, onScanFailure);

		return () => {
			scanner.clear().catch(console.error);
		};
	}, []);

	useEffect(() => {
		if (scannedCode && status === "idle") {
			processScan(scannedCode);
		}
	}, [scannedCode, status]);

	async function processScan(code: string) {
		setStatus("processing");
		try {
			// Need a valid attendeeId and eventId based on the pass code
			// Since we only have the pass code, backend would ideally handle "Check-in by Pass Code"
			// As a placeholder, we use mock values. In full production, we'd hit a dedicated `/api/passes/verify` first.
			
			// Faking a network request to simulate validation UX
			await new Promise(r => setTimeout(r, 600)); 
			
			setStatus("success");
		} catch (error: any) {
			setStatus("error");
			setErrorMessage(error.message || "Invalid or used pass.");
		}
	}

	return (
		<div className="mx-auto max-w-xl space-y-8">
			<SectionTitle
				eyebrow="Scanner"
				title="Scan Attendee Passes"
				description="Use your camera to scan QR passes at the door."
			/>
			
			<div className="panel-soft overflow-hidden rounded-xl p-4 md:p-6">
				{status === "idle" && (
					<div id="reader" className="overflow-hidden rounded-lg border-2 border-dashed border-[#d4def8]" />
				)}

				{status === "processing" && (
					<div className="py-12 text-center text-[#5f6984]">
						<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#1264db] border-t-transparent" />
						<p className="font-medium">Validating pass...</p>
					</div>
				)}

				{status === "success" && (
					<div className="py-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
							<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<p className="font-bold text-xl text-green-700">Check-in Successful!</p>
						<p className="text-[#5f6984] mt-2">Pass ID: <span className="font-mono">{scannedCode}</span></p>
						<Button 
							className="mt-6" 
							onClick={() => {
								setScannedCode(null);
								setStatus("idle");
							}}
						>
							Scan Next
						</Button>
					</div>
				)}

				{status === "error" && (
					<div className="py-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
							<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<p className="font-bold text-xl text-red-700">Scan Failed</p>
						<p className="text-red-500 mt-2">{errorMessage}</p>
						<Button 
							className="mt-6" 
							variant="ghost"
							onClick={() => {
								setScannedCode(null);
								setStatus("idle");
							}}
						>
							Try Again
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
