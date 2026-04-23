import type { Metadata } from "next";
import { CartView } from "@/modules/orders/views/cart-view";

export const metadata: Metadata = {
	title: "Your Cart | UniEvent",
	description: "Review your selected event passes and prepare for checkout.",
};

export default function CartPage() {
	return <CartView />;
}
