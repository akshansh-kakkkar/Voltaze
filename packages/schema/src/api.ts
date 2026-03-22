/**
 * API response shapes shared with the web app.
 */

// ── Events ──

export type EventResponse = {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	coverUrl: string | null;
	startsAt: Date;
	endsAt: Date;
	venueName: string | null;
	address: string | null;
	city: string | null;
	status: string;
};

/** Public event payload from GET /events/:slug (subset of Prisma Event). */
export type EventDetailResponse = {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	coverUrl: string | null;
	startsAt: Date | string;
	endsAt: Date | string;
	venueName: string | null;
	address: string | null;
	city: string | null;
	status: string;
	[key: string]: unknown;
};

// ── Tickets ──

export type TicketTierResponse = {
	id: string;
	eventId: string;
	name: string;
	price: number;
	quantity: number | null;
	sold: number;
	description: string | null;
};

export type TicketStub = {
	id: string;
	code: string;
	tierId: string;
	userId: string;
	quantity: number;
	status: string;
};

export type PurchaseResponse = {
	tickets: TicketStub[];
	primaryTicket: TicketStub;
	paymentRequired: boolean;
	/** Razorpay order id when payment is required (purchase already opened the order). */
	razorpayOrderId?: string;
	/** Amount in paise (INR smallest unit). */
	amountPaise?: number;
	currency?: string;
};

// ── Payments ──

export type PaymentResponse = {
	id: string;
	razorpayOrderId: string | null;
	razorpayPaymentId: string | null;
	amount: number;
	currency: string;
	orderStatus: string;
	createdAt: Date | string;
};

export type PaymentInitializeResponse = {
	id: string;
	razorpayOrderId: string;
	amount: number;
	currency: string;
};

// ── API Error Response ──

export type ApiErrorResponse = {
	error: string;
	message: string;
	status: number;
};

// ── Pagination ──

export type PaginatedResponse<T> = {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
};
