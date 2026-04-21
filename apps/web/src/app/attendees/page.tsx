import { AttendeesView } from "@/modules/attendees"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function AttendeesPage() {
	return <ProtectedRoute><AttendeesView /></ProtectedRoute>;
}
