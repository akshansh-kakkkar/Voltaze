import { env } from "@unievent/env/server";
import type {
	RazorpayOrder,
	RazorpayOrderOptions,
	RazorpayPayment,
	RazorpayRefund,
} from "@unievent/schema";
import Razorpay from "razorpay";

export type {
	RazorpayOrder,
	RazorpayOrderOptions,
	RazorpayPayment,
	RazorpayRefund,
};

export const razorpay = new Razorpay({
	key_id: env.RAZORPAY_KEY_ID,
	key_secret: env.RAZORPAY_KEY_SECRET,
});

export async function createRazorpayOrder(
	options: RazorpayOrderOptions,
): Promise<RazorpayOrder> {
	return razorpay.orders.create(options) as Promise<RazorpayOrder>;
}

export async function fetchRazorpayOrder(
	orderId: string,
): Promise<RazorpayOrder> {
	return razorpay.orders.fetch(orderId) as Promise<RazorpayOrder>;
}

export async function fetchRazorpayPayment(
	paymentId: string,
): Promise<RazorpayPayment> {
	return razorpay.payments.fetch(paymentId) as Promise<RazorpayPayment>;
}

export async function createRazorpayRefund(
	paymentId: string,
	options: {
		amount?: number;
		speed?: "normal" | "optimum";
		notes?: Record<string, string>;
	},
): Promise<RazorpayRefund> {
	return razorpay.payments.refund(
		paymentId,
		options,
	) as Promise<RazorpayRefund>;
}
