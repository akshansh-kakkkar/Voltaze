import type { Express } from "express";

import { createEventsRouter } from "./events.router";

export function registerEventsModule(app: Express) {
	app.use("/api/events", createEventsRouter());
}
