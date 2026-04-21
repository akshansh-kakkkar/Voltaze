import { PaymentsView } from "@/modules/payments"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function PaymentsPage() {
	return <ProtectedRoute><PaymentsView /></ProtectedRoute>;
}
