import db from "@voltaze/db";
import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	image?: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

/**
 * Auth middleware — validates the NeonDB Auth session.
 *
 * Expects a Bearer token in the Authorization header.
 */
export async function requireAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			throw new UnauthorizedError("Missing or invalid authorization header");
		}

		const token = authHeader.slice(7);
		if (!token) {
			throw new UnauthorizedError("Missing token");
		}

		const user = await authenticateBearerToken(token);
		if (!user) {
			throw new UnauthorizedError("Invalid or expired token");
		}

		req.user = user;

		await upsertUserProfile(req.user);

		next();
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			next(error);
		} else {
			next(new UnauthorizedError("Authentication failed"));
		}
	}
}

/**
 * Optional auth — attaches user if token present, continues otherwise.
 */
export async function optionalAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return next();
	}

	try {
		const token = authHeader.slice(7);
		const user = await authenticateBearerToken(token);
		if (!user) return next();

		req.user = user;
		await upsertUserProfile(req.user);
	} catch {
		// Silently continue without auth
	}

	next();
}

async function upsertUserProfile(user: AuthUser) {
	await db.userProfile.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			email: user.email,
			name: user.name || null,
			image: user.image || null,
		},
		update: {
			email: user.email,
			name: user.name || null,
			image: user.image || null,
		},
	});
}

async function authenticateBearerToken(
	token: string,
): Promise<AuthUser | null> {
	const jwtPayload = decodeJwtPayload(token);
	if (jwtPayload) {
		const jwtUser = toAuthUser(jwtPayload);
		if (jwtUser) return jwtUser;
	}

	return await fetchAuthUserFromNeon(token);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
	const parts = token.split(".");
	if (parts.length !== 3) return null;
	const payloadPart = parts[1];
	if (!payloadPart) return null;

	try {
		return JSON.parse(Buffer.from(payloadPart, "base64url").toString());
	} catch {
		return null;
	}
}

function toAuthUser(payload: Record<string, unknown>): AuthUser | null {
	const exp = typeof payload.exp === "number" ? payload.exp : undefined;
	if (exp && Date.now() / 1000 > exp) return null;

	const id =
		typeof payload.sub === "string"
			? payload.sub
			: typeof payload.userId === "string"
				? payload.userId
				: null;
	const email = typeof payload.email === "string" ? payload.email : null;

	if (!id || !email) return null;

	return {
		id,
		email,
		name: typeof payload.name === "string" ? payload.name : "",
		image: typeof payload.picture === "string" ? payload.picture : undefined,
	};
}

async function fetchAuthUserFromNeon(token: string): Promise<AuthUser | null> {
	const upstreamBase = process.env.NEON_AUTH_BASE_URL?.replace(/\/$/, "");
	const webOrigin = process.env.CORS_ORIGIN?.replace(/\/$/, "");
	const sessionEndpoints = [
		upstreamBase ? `${upstreamBase}/get-session` : null,
		webOrigin ? `${webOrigin}/api/auth/get-session` : null,
	].filter((url): url is string => Boolean(url));

	if (!sessionEndpoints.length) return null;

	try {
		for (const sessionEndpoint of sessionEndpoints) {
			const response = await fetch(sessionEndpoint, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) continue;

			const sessionData = (await response.json()) as {
				user?: {
					id?: unknown;
					email?: unknown;
					name?: unknown;
					image?: unknown;
				};
			};

			if (
				typeof sessionData.user?.id !== "string" ||
				typeof sessionData.user?.email !== "string"
			) {
				continue;
			}

			return {
				id: sessionData.user.id,
				email: sessionData.user.email,
				name:
					typeof sessionData.user.name === "string"
						? sessionData.user.name
						: "",
				image:
					typeof sessionData.user.image === "string"
						? sessionData.user.image
						: undefined,
			};
		}

		return null;
	} catch {
		return null;
	}
}
