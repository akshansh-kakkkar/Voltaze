import type { User } from "@unievent/db";
import type { AuthRequestContext } from "@unievent/schema";
import type { Request } from "express";

export type RequestAuthContext = AuthRequestContext;

export type RequestWithAuth = Request & {
	auth?: RequestAuthContext;
	user?: User;
};

export type AuthenticatedRequest = Request & {
	auth: RequestAuthContext;
	user?: User;
};
