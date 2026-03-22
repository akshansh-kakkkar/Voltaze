import db from "@voltaze/db";
import type { Request, Response } from "express";
import { AppError, NotFoundError } from "../lib/errors";
import {
	createRazorpayOrder,
	fetchPaymentDetails,
	createRefund as razorpayCreateRefund,
} from "../lib/razorpay";
import { generateId } from "../lib/utils";
import * as paymentService from "../services/payment.service";

export async function webhook(req: Request, res: Response) {
	const signature = req.headers["x-razorpay-signature"] as string;

	await paymentService.handleWebhook(
		signature,
		JSON.stringify(req.body),
		req.body,
	);

	res.json({ ok: true });
}

export async function initializePayment(req: Request, res: Response) {
	const { ticketId, amount, description } = req.body as {
		ticketId?: string;
		amount?: number;
		description?: string;
	};

	if (!ticketId) {
		throw new AppError("ticketId is required", 400, "INVALID_BODY");
	}

	const ticket = await db.ticket.findUnique({
		where: { id: ticketId },
		include: { tier: true, payment: true },
	});

	if (!ticket) {
		throw new NotFoundError("Ticket");
	}

	// Purchase flow already created Razorpay order — return it (idempotent).
	if (ticket.payment?.razorpayOrderId) {
		return res.json({
			ok: true,
			payment: {
				id: ticket.payment.id,
				razorpayOrderId: ticket.payment.razorpayOrderId,
				amount: ticket.payment.amount,
				currency: ticket.payment.currency,
			},
		});
	}

	const userProfile = await db.userProfile.findUnique({
		where: { userId: ticket.userId },
	});

	const customerEmail = userProfile?.email || `${ticket.userId}@voltaze.local`;
	const orderId = generateId("order");
	const amountPaise = amount ?? 0;

	const paymentRow =
		ticket.payment ??
		(await db.payment.create({
			data: {
				ticketId,
				amount: amountPaise,
				orderStatus: "CREATED",
				currency: ticket.tier.currency,
			},
		}));

	const razorpayOrder = await createRazorpayOrder({
		orderId,
		amount: amountPaise,
		customerId: ticket.userId,
		customerEmail,
		description: description ?? "Voltaze tickets",
		receipt: paymentRow.id,
	});

	const updatedPayment = await db.payment.update({
		where: { id: paymentRow.id },
		data: {
			razorpayOrderId: razorpayOrder.id,
			...(amountPaise > 0 ? { amount: amountPaise } : {}),
		},
	});

	res.json({
		ok: true,
		payment: {
			id: updatedPayment.id,
			razorpayOrderId: razorpayOrder.id,
			amount: razorpayOrder.amount,
			currency: razorpayOrder.currency,
		},
	});
}

export async function getPaymentStatus(req: Request, res: Response) {
	const { paymentId } = req.params as { paymentId: string };

	// Fetch payment from DB
	const payment = await db.payment.findUnique({
		where: { id: paymentId },
	});

	if (!payment) {
		throw new NotFoundError("Payment");
	}

	// If Razorpay payment ID exists, fetch latest status from Razorpay
	if (payment.razorpayPaymentId) {
		const razorpayPayment = await fetchPaymentDetails(
			payment.razorpayPaymentId,
		);
		return res.json({
			success: true,
			payment: {
				id: payment.id,
				status: payment.orderStatus,
				razorpayStatus: razorpayPayment.status,
				amount: payment.amount,
				paidAt: payment.paidAt,
			},
		});
	}

	res.json({
		success: true,
		payment: {
			id: payment.id,
			status: payment.orderStatus,
			amount: payment.amount,
			paidAt: payment.paidAt,
		},
	});
}

export async function createRefund(req: Request, res: Response) {
	const { paymentId } = req.params as { paymentId: string };
	const { amount, reason } = req.body as { amount?: number; reason?: string };

	// Fetch payment from DB
	const payment = await db.payment.findUnique({
		where: { id: paymentId },
	});

	if (!payment) {
		throw new NotFoundError("Payment");
	}

	if (!payment.razorpayPaymentId) {
		throw new AppError(
			"Payment not yet completed",
			400,
			"PAYMENT_NOT_COMPLETED",
		);
	}

	if (payment.orderStatus !== "CAPTURED") {
		throw new AppError(
			"Payment must be captured to refund",
			400,
			"INVALID_PAYMENT_STATUS",
		);
	}

	// Create refund via Razorpay
	const refund = await razorpayCreateRefund({
		paymentId: payment.razorpayPaymentId,
		amount: amount || payment.amount,
	});

	// Update payment with refund details
	const updatedPayment = await db.payment.update({
		where: { id: payment.id },
		data: {
			razorpayRefundId: refund.id,
			refundAmount: refund.amount,
			refundStatus: "SUBMITTED",
			refundReason: reason,
		},
	});

	res.json({
		success: true,
		refund: {
			id: updatedPayment.razorpayRefundId,
			amount: updatedPayment.refundAmount,
			status: updatedPayment.refundStatus,
		},
	});
}
