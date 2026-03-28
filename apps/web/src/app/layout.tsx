import "@mantine/core/styles.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";

import { AppProviders } from "@/common/components/providers";

import "../index.css";

export const metadata: Metadata = {
	title: "Voltaze",
	description: "Voltaze web app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript defaultColorScheme="auto" />
			</head>
			<body>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
