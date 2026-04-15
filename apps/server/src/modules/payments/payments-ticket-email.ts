import { sendZohoTicketMail } from "@/common/utils/mailer";

type TicketForEmail = {
	id: string;
	pricePaid: number;
	tier: {
		name: string;
	};
	pass: {
		code: string;
	} | null;
};

type TicketEmailPayload = {
	paymentId: string;
	currency: string;
	amount: number;
	attendee: {
		name: string;
		email: string;
	};
	event: {
		name: string;
		venueName: string;
		address: string;
		timezone: string;
		startDate: Date;
		endDate: Date;
	};
	tickets: TicketForEmail[];
};

function formatMoney(amount: number, currency: string) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency,
		maximumFractionDigits: 2,
	}).format(amount / 100);
}

function formatDateTime(date: Date, timezone: string) {
	return date.toLocaleString("en-IN", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: timezone,
	});
}

function buildTicketEmailContent(payload: TicketEmailPayload) {
	const totalAmountLabel = formatMoney(payload.amount, payload.currency);
	const startsAt = formatDateTime(
		payload.event.startDate,
		payload.event.timezone,
	);
	const endsAt = formatDateTime(payload.event.endDate, payload.event.timezone);

	const ticketRowsHtml = payload.tickets
		.map((ticket, index) => {
			const passCode = ticket.pass?.code ?? "Will be generated soon";
			const ticketAmount = formatMoney(ticket.pricePaid, payload.currency);

			return `<tr>
		<td style="padding:10px;border-bottom:1px solid #ececec;">${index + 1}</td>
		<td style="padding:10px;border-bottom:1px solid #ececec;">${ticket.tier.name}</td>
		<td style="padding:10px;border-bottom:1px solid #ececec;">${ticket.id}</td>
		<td style="padding:10px;border-bottom:1px solid #ececec;">${passCode}</td>
		<td style="padding:10px;border-bottom:1px solid #ececec;">${ticketAmount}</td>
	</tr>`;
		})
		.join("");

	const ticketRowsText = payload.tickets
		.map((ticket, index) => {
			const passCode = ticket.pass?.code ?? "Will be generated soon";
			const ticketAmount = formatMoney(ticket.pricePaid, payload.currency);
			return `${index + 1}. ${ticket.tier.name} | Ticket: ${ticket.id} | Pass: ${passCode} | Amount: ${ticketAmount}`;
		})
		.join("\n");

	const subject = `Your tickets are confirmed for ${payload.event.name}`;
	const text = [
		`Hi ${payload.attendee.name},`,
		"",
		"Your payment has been confirmed and your tickets are now issued.",
		`Payment ID: ${payload.paymentId}`,
		`Total Paid: ${totalAmountLabel}`,
		"",
		`Event: ${payload.event.name}`,
		`Venue: ${payload.event.venueName}`,
		`Address: ${payload.event.address}`,
		`Starts: ${startsAt}`,
		`Ends: ${endsAt}`,
		"",
		"Tickets:",
		ticketRowsText,
		"",
		"Please keep this email for entry and verification.",
	].join("\n");

	const html = `
	<div style="font-family:Arial,sans-serif;background:#f8f9fb;padding:24px;">
		<div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e9ebf0;border-radius:12px;overflow:hidden;">
			<div style="padding:24px;background:#121926;color:#ffffff;">
				<h2 style="margin:0 0 6px 0;">Ticket Confirmation</h2>
				<p style="margin:0;opacity:0.9;">${payload.event.name}</p>
			</div>
			<div style="padding:24px;color:#1f2937;">
				<p style="margin:0 0 14px 0;">Hi ${payload.attendee.name},</p>
				<p style="margin:0 0 14px 0;">Your payment has been confirmed and your tickets are now issued.</p>
				<p style="margin:0 0 6px 0;"><strong>Payment ID:</strong> ${payload.paymentId}</p>
				<p style="margin:0 0 20px 0;"><strong>Total Paid:</strong> ${totalAmountLabel}</p>

				<div style="padding:14px;border:1px solid #ececec;border-radius:10px;background:#fafafa;margin-bottom:20px;">
					<p style="margin:0 0 6px 0;"><strong>Venue:</strong> ${payload.event.venueName}</p>
					<p style="margin:0 0 6px 0;"><strong>Address:</strong> ${payload.event.address}</p>
					<p style="margin:0 0 6px 0;"><strong>Starts:</strong> ${startsAt}</p>
					<p style="margin:0;"><strong>Ends:</strong> ${endsAt}</p>
				</div>

				<table style="width:100%;border-collapse:collapse;border:1px solid #ececec;border-radius:10px;overflow:hidden;">
					<thead>
						<tr style="background:#f3f4f6;text-align:left;color:#111827;">
							<th style="padding:10px;">#</th>
							<th style="padding:10px;">Tier</th>
							<th style="padding:10px;">Ticket ID</th>
							<th style="padding:10px;">Pass Code</th>
							<th style="padding:10px;">Amount</th>
						</tr>
					</thead>
					<tbody>
						${ticketRowsHtml}
					</tbody>
				</table>

				<p style="margin:18px 0 0 0;">Please keep this email for entry and verification.</p>
			</div>
		</div>
	</div>`;

	return { subject, text, html };
}

export async function sendPaymentTicketConfirmationEmail(
	payload: TicketEmailPayload,
) {
	const content = buildTicketEmailContent(payload);
	return sendZohoTicketMail({
		to: payload.attendee.email,
		subject: content.subject,
		text: content.text,
		html: content.html,
	});
}
