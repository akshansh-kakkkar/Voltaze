import axios from "axios";
import { getApiBaseUrl } from "./backend-url";

const REQUEST_TIMEOUT_MS = 15_000;

export type QueryValue = string | number | boolean | Date | null | undefined;

function normalizeQueryValue(
	value: QueryValue,
): string | number | boolean | undefined {
	if (value === null || value === undefined) {
		return undefined;
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length === 0 ? undefined : trimmed;
	}

	return value;
}

export function toQueryParams(
	input: Record<string, QueryValue>,
): Record<string, string | number | boolean> {
	const output: Record<string, string | number | boolean> = {};

	for (const [key, value] of Object.entries(input)) {
		const normalized = normalizeQueryValue(value);
		if (normalized !== undefined) {
			output[key] = normalized;
		}
	}

	return output;
}

export const apiClient = axios.create({
	baseURL: getApiBaseUrl(),
	timeout: REQUEST_TIMEOUT_MS,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});
