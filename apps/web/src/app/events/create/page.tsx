import { CreateEventView } from "@/modules/events/views/create-event-view";
import { ProtectedRoute } from "@/core/components/protected-route";

export default function CreateEventPage() {
	return (
		<ProtectedRoute allowedRoles={["ADMIN", "HOST"]}>
			<CreateEventView />
		</ProtectedRoute>
	);
}
