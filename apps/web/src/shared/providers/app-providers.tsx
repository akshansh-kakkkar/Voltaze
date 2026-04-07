"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/shared/lib/query-client";
import { TopLoader } from "@/shared/ui/top-loader/top-loader";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<Suspense fallback={null}>
				<TopLoader />
			</Suspense>
			{children}
			<Toaster richColors position="top-right" />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
