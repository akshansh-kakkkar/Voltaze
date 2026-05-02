import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AppProviders } from "@/core/providers/app-providers";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-poppins",
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
	),
	title: {
		default: "UniEvent | Academic Event Ecosystem",
		template: "%s | UniEvent",
	},
	description:
		"The definitive platform for managing, discovering, and attending academic events and conferences.",
	keywords: [
		"University Events",
		"Ticketing",
		"Academic Conference",
		"UniEvent",
	],
	authors: [{ name: "UniEvent Team" }],
	creator: "UniEvent",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		siteName: "UniEvent",
		title: "UniEvent | Academic Event Ecosystem",
		description: "Create, manage, and attend events with UniEvent",
		images: [
			{
				url: "/assets/og-image.png",
				width: 1200,
				height: 630,
				alt: "UniEvent",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "UniEvent | Academic Event Ecosystem",
		description: "Create, manage, and attend events with UniEvent",
		images: ["/assets/og-image.png"],
	},
	icons: {
		icon: "/assets/logo_circle_svg.svg",
		apple: "/assets/apple-touch-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={poppins.variable}>
			<body suppressHydrationWarning className="font-poppins antialiased">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
