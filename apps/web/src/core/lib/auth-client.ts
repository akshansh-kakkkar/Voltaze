import { createAuthClient } from "better-auth/react";
import { getApiBaseUrlCandidates } from "@/core/lib/backend-url";

function getAuthBaseUrl(): string {
	if (typeof window !== "undefined") {
		// Keep auth calls same-origin in the browser; Next rewrites /api/* to the server.
		return `${window.location.origin}/api/auth`;
	}

	const [firstCandidate] = getApiBaseUrlCandidates();
	if (firstCandidate) {
		const normalized = firstCandidate.replace(/\/+$/, "");
		return `${normalized.replace(/\/api$/i, "")}/auth`;
	}

	return "http://localhost:3001/api/auth";
}

export const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
});
