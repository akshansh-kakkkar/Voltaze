import { PassesView } from "@/modules/passes"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function PassesPage() {
	return <ProtectedRoute><PassesView /></ProtectedRoute>;
}
