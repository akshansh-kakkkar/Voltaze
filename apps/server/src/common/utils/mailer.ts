import { env } from "@voltaze/env/server";
import nodemailer from "nodemailer";

type ZohoMailInput = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

let transporter: nodemailer.Transporter | null = null;

export function isZohoTicketEmailEnabled() {
	return env.ZOHO_TICKET_EMAIL_ENABLED === "true";
}

export function validateZohoTicketEmailConfig() {
	if (!isZohoTicketEmailEnabled()) {
		return;
	}

	const missingFields = [
		env.ZOHO_SMTP_USER ? null : "ZOHO_SMTP_USER",
		env.ZOHO_SMTP_PASS ? null : "ZOHO_SMTP_PASS",
		env.ZOHO_MAIL_FROM ? null : "ZOHO_MAIL_FROM",
	].filter((field): field is string => field !== null);

	if (missingFields.length > 0) {
		throw new Error(
			`Zoho ticket email is enabled but missing required env vars: ${missingFields.join(
				", ",
			)}. Set them in apps/server/.env before starting the server.`,
		);
	}
}

function getMailerConfig() {
	const host = env.ZOHO_SMTP_HOST;
	const port = env.ZOHO_SMTP_PORT;
	const secure = env.ZOHO_SMTP_SECURE === "true";
	const user = env.ZOHO_SMTP_USER;
	const pass = env.ZOHO_SMTP_PASS;
	const from = env.ZOHO_MAIL_FROM ?? user;

	if (!user || !pass || !from) {
		throw new Error(
			"Missing Zoho SMTP config. Set ZOHO_SMTP_USER, ZOHO_SMTP_PASS, and ZOHO_MAIL_FROM (or ZOHO_SMTP_USER).",
		);
	}

	return { host, port, secure, user, pass, from };
}

function getTransporter() {
	if (transporter) {
		return transporter;
	}

	const config = getMailerConfig();
	transporter = nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth: {
			user: config.user,
			pass: config.pass,
		},
	});

	return transporter;
}

export async function sendZohoTicketMail(input: ZohoMailInput) {
	if (!isZohoTicketEmailEnabled()) {
		return {
			skipped: true,
			reason: "ZOHO_TICKET_EMAIL_ENABLED is false",
		};
	}

	const config = getMailerConfig();
	const client = getTransporter();
	const info = await client.sendMail({
		from: config.from,
		to: input.to,
		subject: input.subject,
		text: input.text,
		html: input.html,
	});

	return {
		skipped: false,
		messageId: info.messageId,
	};
}
