"use client";

import { useQuery } from "@tanstack/react-query";
import type { Event } from "@voltaze/schema";
import { useMemo } from "react";
import type { PaginatedResponse } from "../../../shared/types/api";
import { eventsService } from "../services/events.service";

export function useSearchSuggestions(query: string) {
	const { data: eventsData, isLoading } = useQuery<PaginatedResponse<Event>>({
		queryKey: ["events:search", query],
		queryFn: () =>
			eventsService.getEvents({
				limit: 50,
				page: 1,
				sortBy: "startDate",
				sortOrder: "asc",
			}),
		enabled: query.length >= 1,
		staleTime: 1000 * 60 * 5,
	});

	const suggestions = useMemo(() => {
		if (!query.trim() || !eventsData?.data) {
			return [];
		}

		const lowerQuery = query.toLowerCase().trim();
		const queryWords = lowerQuery.split(/\s+/);

		const filtered = eventsData.data.filter((event: Event) => {
			const eventName = event.name.toLowerCase();
			const eventAddress = (event.address || "").toLowerCase();
			const eventVenue = (event.venueName || "").toLowerCase();
			const searchText = `${eventName} ${eventAddress} ${eventVenue}`;

			return queryWords.every((word) => searchText.includes(word));
		});

		return filtered.sort((a: Event, b: Event) => {
			const aNameMatch = a.name.toLowerCase().startsWith(lowerQuery) ? 1 : 0;
			const bNameMatch = b.name.toLowerCase().startsWith(lowerQuery) ? 1 : 0;
			return bNameMatch - aNameMatch;
		});
	}, [query, eventsData?.data]);

	return { suggestions, isLoading };
}
