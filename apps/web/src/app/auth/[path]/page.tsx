import { AuthView } from "@neondatabase/auth/react/ui";
import { authViewPaths } from "@neondatabase/auth/react/ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
	return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
	params,
}: {
	params: Promise<{ path: string }>;
}) {
	const { path } = await params;

	return (
		<main className="flex min-h-svh grow flex-col items-center justify-center bg-muted px-6 py-16">
			<div className="w-full max-w-md bg-card p-8 md:p-10">
				<AuthView path={path} />
			</div>
		</main>
	);
}
