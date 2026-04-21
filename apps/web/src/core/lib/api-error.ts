import axios from "axios";

type ApiErrorPayload = {
	message?: string;
	details?: unknown;
};

function extractPayloadMessage(payload: unknown): string | null {
	if (!payload || typeof payload !== "object") {
		return null;
	}

	const record = payload as ApiErrorPayload;

	if (typeof record.message === "string" && record.message.trim().length > 0) {
		return record.message;
	}

	return null;
}

export function getApiErrorMessage(
	error: unknown,
	fallback = "Something went wrong.",
): string {
	if (axios.isAxiosError(error)) {
		if (error.code === "ECONNABORTED") {
			return "The request timed out. Please try again.";
		}

		const payloadMessage = extractPayloadMessage(error.response?.data);
		if (payloadMessage) {
			return payloadMessage;
		}

		if (error.response?.status === 401) {
			return "You are not authenticated.";
		}

		if (error.response?.status === 403) {
			return "You do not have permission for this action.";
		}

		if (error.response?.status === 404) {
			return "The requested resource could not be found.";
		}

		if (error.response?.status && error.response.status >= 500) {
			return "The server encountered an error. Please try again shortly.";
		}
	}

	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message;
	}

	return fallback;
}
