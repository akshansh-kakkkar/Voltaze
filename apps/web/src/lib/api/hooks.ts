"use client";

import type {
	EventDetailResponse,
	EventResponse,
	PaymentInitializeResponse,
	PurchaseResponse,
	TicketTierResponse,
} from "@voltaze/schema";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "../auth/client";
import { apiClient } from "./client";

/**
 * Org API Hooks
 */

export function useCreateOrg() {
	const [state, setState] = useState<UseMutationState<any>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(
		async (payload: { name: string; slug?: string }) => {
			try {
				setState({ data: null, isLoading: true, error: null });
				const response = await apiClient.post<any>("/orgs", payload);
				setState({
					data: response?.data || response,
					isLoading: false,
					error: null,
				});
				return response?.data || response;
			} catch (error) {
				const err = error instanceof Error ? error : new Error("Unknown error");
				setState({ data: null, isLoading: false, error: err });
				throw err;
			}
		},
		[],
	);

	return { ...state, mutate };
}

export function useListOrgs() {
	const [state, setState] = useState<UseQueryState<any[]>>({
		data: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		const fetchOrgs = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await apiClient.get<any>("/orgs");
				setState({ data: response?.data || [], isLoading: false, error: null });
			} catch (error) {
				setState({
					data: null,
					isLoading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchOrgs();
	}, []);

	return state;
}

/**
 * Events API Hooks
 */

interface UseQueryState<T> {
	data: T | null;
	isLoading: boolean;
	error: Error | null;
}

export function useEvents(query?: { search?: string; status?: string }) {
	const [state, setState] = useState<UseQueryState<EventResponse[]>>({
		data: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const params = new URLSearchParams();
				if (query?.search) params.append("search", query.search);
				if (query?.status) params.append("status", query.status);
				const queryString = params.toString();
				const endpoint = queryString ? `/events?${queryString}` : "/events";
				const response = await apiClient.get<any>(endpoint);
				setState({
					data: response?.events || [],
					isLoading: false,
					error: null,
				});
			} catch (error) {
				setState({
					data: null,
					isLoading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchEvents();
	}, [query?.search, query?.status]);

	return state;
}

export function useEventBySlug(slug: string) {
	const [state, setState] = useState<UseQueryState<EventDetailResponse>>({
		data: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		if (!slug) {
			setState({ data: null, isLoading: false, error: null });
			return;
		}

		const fetchEvent = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await apiClient.get<{
					ok?: boolean;
					data?: EventDetailResponse;
				}>(`/events/${slug}`);
				setState({
					data: response?.data ?? (response as unknown as EventDetailResponse),
					isLoading: false,
					error: null,
				});
			} catch (error) {
				setState({
					data: null,
					isLoading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchEvent();
	}, [slug]);

	return state;
}

export function useListOrgEvents(orgId?: string) {
	const [state, setState] = useState<UseQueryState<EventResponse[]>>({
		data: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		if (!orgId) {
			setState({ data: null, isLoading: false, error: null });
			return;
		}

		const fetchEvents = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await apiClient.get<any>(`/events/org/${orgId}`);
				setState({ data: response?.data || [], isLoading: false, error: null });
			} catch (error) {
				setState({
					data: null,
					isLoading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchEvents();
	}, [orgId]);

	return state;
}

export function useCreateEvent() {
	const [state, setState] = useState<UseMutationState<EventResponse>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(async (orgId: string, payload: any) => {
		try {
			setState({ data: null, isLoading: true, error: null });
			const response = await apiClient.post<{
				ok?: boolean;
				data?: EventResponse;
			}>(`/events/org/${orgId}`, payload);
			const ev = response?.data ?? (response as unknown as EventResponse);
			setState({ data: ev, isLoading: false, error: null });
			return ev;
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Unknown error");
			setState({ data: null, isLoading: false, error: err });
			throw err;
		}
	}, []);

	return { ...state, mutate };
}

export function useUpdateEvent() {
	const [state, setState] = useState<UseMutationState<EventResponse>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(async (eventId: string, payload: any) => {
		try {
			setState({ data: null, isLoading: true, error: null });
			const response = await apiClient.patch<EventResponse>(
				`/events/${eventId}`,
				payload,
			);
			setState({ data: response, isLoading: false, error: null });
			return response;
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Unknown error");
			setState({ data: null, isLoading: false, error: err });
			throw err;
		}
	}, []);

	return { ...state, mutate };
}

export function useDeleteEvent() {
	const [state, setState] = useState<UseMutationState<any>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(async (eventId: string) => {
		try {
			setState({ data: null, isLoading: true, error: null });
			const response = await apiClient.delete<any>(`/events/${eventId}`);
			setState({ data: response, isLoading: false, error: null });
			return response;
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Unknown error");
			setState({ data: null, isLoading: false, error: err });
			throw err;
		}
	}, []);

	return { ...state, mutate };
}

export function useTicketTiers(eventId: string) {
	const [state, setState] = useState<UseQueryState<TicketTierResponse[]>>({
		data: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		if (!eventId) {
			setState({ data: null, isLoading: false, error: null });
			return;
		}

		const fetchTiers = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await apiClient.get<any>(
					`/tickets/events/${eventId}/tiers`,
				);
				setState({ data: response?.data || [], isLoading: false, error: null });
			} catch (error) {
				setState({
					data: null,
					isLoading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchTiers();
	}, [eventId]);

	return state;
}

export function useCreateTicketTier() {
	const [state, setState] = useState<UseMutationState<TicketTierResponse>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(async (eventId: string, payload: any) => {
		try {
			setState({ data: null, isLoading: true, error: null });
			const response = await apiClient.post<TicketTierResponse>(
				`/tickets/events/${eventId}/tiers`,
				payload,
			);
			setState({ data: response, isLoading: false, error: null });
			return response;
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Unknown error");
			setState({ data: null, isLoading: false, error: err });
			throw err;
		}
	}, []);

	return { ...state, mutate };
}

export function useUpdateTicketTier() {
	const [state, setState] = useState<UseMutationState<TicketTierResponse>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(async (tierId: string, payload: any) => {
		try {
			setState({ data: null, isLoading: true, error: null });
			const response = await apiClient.patch<TicketTierResponse>(
				`/tickets/tiers/${tierId}`,
				payload,
			);
			setState({ data: response, isLoading: false, error: null });
			return response;
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Unknown error");
			setState({ data: null, isLoading: false, error: err });
			throw err;
		}
	}, []);

	return { ...state, mutate };
}

export function useDeleteTicketTier() {
	const [state, setState] = useState<UseMutationState<any>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(async (tierId: string) => {
		try {
			setState({ data: null, isLoading: true, error: null });
			const response = await apiClient.delete<any>(`/tickets/tiers/${tierId}`);
			setState({ data: response, isLoading: false, error: null });
			return response;
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Unknown error");
			setState({ data: null, isLoading: false, error: err });
			throw err;
		}
	}, []);

	return { ...state, mutate };
}

/**
 * Tickets/Orders API Hooks
 */

interface UseMutationState<T> {
	data: T | null;
	isLoading: boolean;
	error: Error | null;
}

export function usePurchaseTickets() {
	const [state, setState] = useState<UseMutationState<PurchaseResponse>>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(
		async (data: {
			eventId: string;
			items: Array<{ tierId: string; quantity: number }>;
			promoCode?: string;
		}) => {
			try {
				setState({ data: null, isLoading: true, error: null });
				const response = await apiClient.post<{
					ok: boolean;
					data: PurchaseResponse;
				}>(`/tickets/events/${data.eventId}/purchase`, {
					items: data.items,
					promoCode: data.promoCode,
				});
				const payload =
					response?.data ?? (response as unknown as PurchaseResponse);
				setState({ data: payload, isLoading: false, error: null });
				return payload;
			} catch (error) {
				const err = error instanceof Error ? error : new Error("Unknown error");
				setState({ data: null, isLoading: false, error: err });
				throw err;
			}
		},
		[],
	);

	return { ...state, mutate };
}

/**
 * Payments API Hooks
 */

export function useUserTickets() {
	const [state, setState] = useState<UseQueryState<any[]>>({
		data: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await apiClient.get<any>("/tickets/user");
				setState({ data: response?.data || [], isLoading: false, error: null });
			} catch (error) {
				setState({
					data: null,
					isLoading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchTickets();
	}, []);

	return state;
}

export function useInitializePayment() {
	const [state, setState] = useState<
		UseMutationState<PaymentInitializeResponse>
	>({
		data: null,
		isLoading: false,
		error: null,
	});

	const mutate = useCallback(
		async (data: {
			ticketId: string;
			amount: number;
			description?: string;
		}) => {
			try {
				setState({ data: null, isLoading: true, error: null });
				const response = await apiClient.post<{
					ok: boolean;
					payment: PaymentInitializeResponse;
				}>("/payments/initialize", {
					ticketId: data.ticketId,
					amount: data.amount,
					description: data.description,
				});
				const pay =
					response?.payment ??
					(response as unknown as PaymentInitializeResponse);
				setState({ data: pay, isLoading: false, error: null });
				return pay;
			} catch (error) {
				const err = error instanceof Error ? error : new Error("Unknown error");
				setState({ data: null, isLoading: false, error: err });
				throw err;
			}
		},
		[],
	);

	return { ...state, mutate };
}

export function useCheckPaymentStatus(paymentId?: string) {
	const [state, setState] = useState<UseQueryState<any>>({
		data: null,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		if (!paymentId) {
			setState({ data: null, isLoading: false, error: null });
			return;
		}

		const fetchStatus = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await apiClient.get<any>(`/payments/${paymentId}`);
				setState({
					data: response?.data || null,
					isLoading: false,
					error: null,
				});
			} catch (error) {
				setState({
					data: null,
					isLoading: false,
					error: error instanceof Error ? error : new Error("Unknown error"),
				});
			}
		};

		fetchStatus();
	}, [paymentId]);

	return state;
}
