import { env } from "@unievent/env/web";

function splitCsvUrls(value?: string): string[] {
	if (!value) {
		return [];
	}

	return value
		.split(",")
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

function stripTrailingSlash(value: string): string {
	return value.replace(/\/+$/, "");
}

function normalizeApiUrl(value: string): string | null {
	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return null;
	}

	return stripTrailingSlash(trimmed);
}

function normalizeServerUrl(value: string): string | null {
	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return null;
	}

	const normalized = stripTrailingSlash(trimmed);

	return normalized;
}

function unique(values: string[]): string[] {
	return [...new Set(values)];
}

export function getApiBaseUrlCandidates(): string[] {
	const explicitApiUrls = [
		env.NEXT_PUBLIC_API_URL,
		...splitCsvUrls(env.NEXT_PUBLIC_API_URLS),
	]
		.map((url) => (typeof url === "string" ? normalizeApiUrl(url) : null))
		.filter((url): url is string => Boolean(url));

	const serverUrls = [
		env.NEXT_PUBLIC_SERVER_URL,
		...splitCsvUrls(env.NEXT_PUBLIC_SERVER_URLS),
	]
		.map((url) => (typeof url === "string" ? normalizeServerUrl(url) : null))
		.filter((url): url is string => Boolean(url));

	return unique([...explicitApiUrls, ...serverUrls]);
}

export function getApiBaseUrl(): string {
	if (typeof window !== "undefined") {
		// Use same-origin proxy from the browser to avoid local port/config drift.
		return "/api";
	}

	const candidates = getApiBaseUrlCandidates();

	const [firstCandidate] = candidates;
	return firstCandidate ?? "http://localhost:3000";
}
