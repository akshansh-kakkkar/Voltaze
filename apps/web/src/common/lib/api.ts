import { env } from "@voltaze/env/web";
import axios from "axios";

/** Base URL for the Express API (no trailing slash). */
export function apiBaseUrl(): string {
	return env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
}

/** Build an absolute API URL from a path (e.g. `"/health"`). */
export function apiUrl(path: string): string {
	const base = apiBaseUrl();
	const p = path.startsWith("/") ? path : `/${path}`;
	return `${base}${p}`;
}

/** Shared Axios instance for the Express API. */
export const apiClient = axios.create({
	baseURL: apiBaseUrl(),
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});
