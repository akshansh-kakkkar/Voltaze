import { OrdersView } from "@/modules/orders";
import { ProtectedRoute } from "@/core/components/protected-route";

export default function OrdersPage() {
	return (
		<ProtectedRoute>
			<OrdersView />
		</ProtectedRoute>
	);
}
