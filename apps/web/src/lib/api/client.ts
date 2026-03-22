/**
 * API Client for communicating with the backend
 * Handles authentication, request/response serialization, and error handling
 */

const API_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api`;

interface RequestOptions extends Omit<RequestInit, "headers"> {
	headers?: Record<string, string>;
}

class APIClient {
	private baseUrl: string;
	private getAuthToken: (() => Promise<string | null>) | null = null;

	constructor(baseUrl = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	setAuthTokenGetter(getter: () => Promise<string | null>) {
		this.getAuthToken = getter;
	}

	private async getHeaders(): Promise<Record<string, string>> {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (this.getAuthToken) {
			const token = await this.getAuthToken();
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
		}

		return headers;
	}

	async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = await this.getHeaders();

		const response = await fetch(url, {
			...options,
			headers: {
				...headers,
				...(options.headers || {}),
			},
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(
				`API Error: ${response.status} - ${error || response.statusText}`,
			);
		}

		return response.json();
	}

	get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "GET" });
	}

	post<T>(
		endpoint: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	patch<T>(
		endpoint: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: "DELETE" });
	}
}

export const apiClient = new APIClient();
