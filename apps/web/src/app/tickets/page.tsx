import { TicketsView } from "@/modules/tickets"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function TicketsPage() {
	return <ProtectedRoute><TicketsView /></ProtectedRoute>;
}
