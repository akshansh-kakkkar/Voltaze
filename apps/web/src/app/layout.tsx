import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/core/app-shell";
import { AppProviders } from "@/core/providers/app-providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-jakarta",
});

const display = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-display",
});

export const metadata: Metadata = {
	title: "UniEvents | Event Platform",
	description:
		"Discover events, view schedules, manage mobile tickets, and track readiness from one frontend experience.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${jakarta.variable} ${display.variable}`}>
				<AppProviders>
					<AppShell>{children}</AppShell>
				</AppProviders>
			</body>
		</html>
	);
}
