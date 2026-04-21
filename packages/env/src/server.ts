import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const DEV_RAZORPAY_KEY_ID = "rzp_test_development_key_id";
const DEV_RAZORPAY_KEY_SECRET = "development-razorpay-key-secret-12345";
const DEV_RAZORPAY_WEBHOOK_SECRET =
	"development-razorpay-webhook-secret-change-me-12345";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_URL: z.string().url().optional(),
		BETTER_AUTH_API_KEY: z.string().min(1).optional(),
		GOOGLE_CLIENT_ID: z.string().min(1).optional(),
		GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
		AUTH_COOKIE_DOMAIN: z.string().min(1).optional(),
		CORS_ORIGIN: z
			.string()
			.min(1)
			.refine(
				(value) =>
					value
						.split(",")
						.map((origin) => origin.trim())
						.filter(Boolean)
						.every((origin) => {
							try {
								new URL(origin);
								return true;
							} catch {
								return false;
							}
						}),
				"CORS_ORIGIN must be a valid URL or comma-separated list of valid URLs",
			),
		RAZORPAY_KEY_ID: z
			.string()
			.min(1)
			.default(DEV_RAZORPAY_KEY_ID)
			.refine(
				(value) =>
					process.env.NODE_ENV !== "production" ||
					value !== DEV_RAZORPAY_KEY_ID,
				"RAZORPAY_KEY_ID must be set to a non-default value in production",
			),
		RAZORPAY_KEY_SECRET: z
			.string()
			.min(1)
			.default(DEV_RAZORPAY_KEY_SECRET)
			.refine(
				(value) =>
					process.env.NODE_ENV !== "production" ||
					value !== DEV_RAZORPAY_KEY_SECRET,
				"RAZORPAY_KEY_SECRET must be set to a non-default value in production",
			),
		RAZORPAY_WEBHOOK_SECRET: z
			.string()
			.min(1)
			.default(DEV_RAZORPAY_WEBHOOK_SECRET),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		WEB_APP_URL: z.string().url().optional(),
		BREVO_API_KEY: z.string().min(1).optional(),
		BREVO_MAIL_FROM: z.string().email().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
