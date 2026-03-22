import type { Request, Response } from "express";
import { AppError } from "../lib/errors";
import * as ticketService from "../services/ticket.service";

function param(req: Request, key: string): string {
	const val = req.params[key];
	const first = Array.isArray(val) ? val[0] : val;
	if (!first)
		throw new AppError(`Missing route param: ${key}`, 400, "BAD_REQUEST");
	return first;
}

function requireUser(req: Request): { id: string; email: string } {
	const id = req.user?.id;
	const email = req.user?.email;
	if (!id || !email) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
	return { id, email };
}

function requireUserId(req: Request): string {
	const id = req.user?.id;
	if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
	return id;
}

export async function createTier(req: Request, res: Response) {
	const tier = await ticketService.createTier(param(req, "eventId"), req.body);
	res.status(201).json({ ok: true, data: tier });
}

export async function listTiers(req: Request, res: Response) {
	const tiers = await ticketService.listTiers(param(req, "eventId"));
	res.json({ ok: true, data: tiers });
}

export async function updateTier(req: Request, res: Response) {
	const tier = await ticketService.updateTier(param(req, "tierId"), req.body);
	res.json({ ok: true, data: tier });
}

export async function deleteTier(req: Request, res: Response) {
	await ticketService.deleteTier(param(req, "tierId"));
	res.json({ ok: true });
}

export async function createPromoCode(req: Request, res: Response) {
	const promo = await ticketService.createPromoCode(
		param(req, "eventId"),
		req.body,
	);
	res.status(201).json({ ok: true, data: promo });
}

export async function listPromoCodes(req: Request, res: Response) {
	const codes = await ticketService.listPromoCodes(param(req, "eventId"));
	res.json({ ok: true, data: codes });
}

export async function purchase(req: Request, res: Response) {
	const user = requireUser(req);
	const result = await ticketService.purchaseTicket(
		param(req, "eventId"),
		user.id,
		user.email,
		req.body,
	);
	res.status(201).json({ ok: true, data: result });
}

export async function getUserTickets(req: Request, res: Response) {
	const tickets = await ticketService.getUserTickets(requireUserId(req));
	res.json({ ok: true, data: tickets });
}

export async function checkIn(req: Request, res: Response) {
	const record = await ticketService.checkIn(req.body, req.user?.id);
	res.status(201).json({ ok: true, data: record });
}
