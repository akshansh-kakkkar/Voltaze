import { updateProfileSchema, userFilterSchema, userIdParamSchema } from "@unievent/schema";
import { Router } from "express";

import { requireAuth } from "@/common/middlewares/auth.middleware";
import { requireRoles } from "@/common/middlewares/auth.middleware";
import { validatePipe } from "@/common/pipes/validate.pipe";
import { asyncHandler } from "@/common/utils/async-handler";

import { usersController } from "./users.controller";

export function createUsersRouter(): Router {
	const router = Router();

	/**
	 * GET /users/me
	 * Get the currently authenticated user's profile.
	 */
	router.get(
		"/me",
		requireAuth,
		asyncHandler((req, res) => usersController.getMe(req, res)),
	);

	/**
	 * PATCH /users/me
	 * Update the currently authenticated user's profile (name, image, skills).
	 */
	router.patch(
		"/me",
		requireAuth,
		validatePipe({ body: updateProfileSchema }),
		asyncHandler((req, res) => usersController.updateMe(req, res)),
	);

	/**
	 * GET /users
	 * List users. Non-admins only see HOSTs.
	 */
	router.get(
		"/",
		requireAuth,
		validatePipe({ query: userFilterSchema }),
		asyncHandler((req, res) => usersController.list(req, res)),
	);

	/**
	 * GET /users/:userId/host-profile
	 * get a host's public profile with their public events.
	 * Accessible without authentication.
	 */
	router.get(
		"/:userId/host-profile",
		validatePipe({ params: userIdParamSchema }),
		asyncHandler((req, res) => usersController.getHostProfile(req, res)),
	);

	/**
	 * GET /users/:userId
	 * Get a user by ID. Requires auth.
	 */
	router.get(
		"/:userId",
		requireAuth,
		validatePipe({ params: userIdParamSchema }),
		asyncHandler((req, res) => usersController.getById(req, res)),
	);

	/**
	 * PATCH /users/:userId
	 * Admin-only: update any user's profile or role.
	 */
	router.patch(
		"/:userId",
		requireAuth,
		requireRoles("ADMIN"),
		validatePipe({ params: userIdParamSchema }),
		asyncHandler((req, res) => usersController.adminUpdate(req, res)),
	);

	return router;
}
