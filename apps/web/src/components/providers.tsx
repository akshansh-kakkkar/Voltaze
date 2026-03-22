"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import { Toaster } from "@voltaze/ui/components/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";
import { CartProvider } from "@/lib/cart-context";
import { ThemeProvider } from "./theme-provider";

type AuthLinkProps = {
	href: string;
	className?: string;
	children: React.ReactNode;
};

export default function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	useEffect(() => {
		apiClient.setAuthTokenGetter(async () => {
			const { data: session } = await authClient.getSession();
			return session?.session?.token ?? null;
		});
	}, []);

	const navigate = (href: string) => {
		router.push(href as never);
	};

	const replace = (href: string) => {
		router.replace(href as never);
	};

	const AuthLink = ({ href, className, children }: AuthLinkProps) => {
		return (
			<Link href={href as never} className={className}>
				{children}
			</Link>
		);
	};

	return (
		<NeonAuthUIProvider
			authClient={authClient}
			navigate={navigate}
			replace={replace}
			onSessionChange={() => {
				router.refresh();
			}}
			social={{
				providers: ["google"],
			}}
			redirectTo="/"
			Link={AuthLink}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				enableSystem
				disableTransitionOnChange
			>
				<CartProvider>
					{children}
					<Toaster richColors />
				</CartProvider>
			</ThemeProvider>
		</NeonAuthUIProvider>
	);
}
