import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-display",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Voltaze — Events & tickets",
	description: "Host and discover events. The Kinetic Monolith.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${spaceGrotesk.variable} bg-background font-sans text-foreground antialiased`}
			>
				<Providers>
					<div className="grid min-h-svh grid-rows-[auto_1fr]">
						<SiteHeader />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
