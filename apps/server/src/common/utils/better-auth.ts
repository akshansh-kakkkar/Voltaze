import { prisma } from "@voltaze/db";
import { env } from "@voltaze/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getAllowedCorsOrigins } from "./cors-origins";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "USER",
				input: false,
			},
		},
	},
	trustedOrigins: getAllowedCorsOrigins(),
});
