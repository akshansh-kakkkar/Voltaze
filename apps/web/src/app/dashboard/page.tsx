import { DashboardView } from "@/modules/dashboard"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function DashboardPage() {
	return <ProtectedRoute><DashboardView /></ProtectedRoute>;
}
