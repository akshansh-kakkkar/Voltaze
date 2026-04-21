import { NotificationsView } from "@/modules/notifications"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function NotificationsPage() {
	return <ProtectedRoute><NotificationsView /></ProtectedRoute>;
}
