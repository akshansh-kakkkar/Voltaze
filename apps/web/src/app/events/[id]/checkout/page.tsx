import { CheckoutView } from "@/modules/events/views/checkout-view";
import { ProtectedRoute } from "@/core/components/protected-route";

export default async function CheckoutPage(props: {
	params: Promise<{ id: string }>;
}) {
	const params = await props.params;

	return (
		<ProtectedRoute>
			<CheckoutView eventId={params.id} />
		</ProtectedRoute>
	);
}
