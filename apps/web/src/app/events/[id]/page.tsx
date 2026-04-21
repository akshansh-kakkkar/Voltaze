import { EventDetailView } from "@/modules/events";

export default async function EventDetailPage(props: {
	params: Promise<{ id: string }>;
}) {
	const params = await props.params;
	return <EventDetailView eventId={params.id} />;
}