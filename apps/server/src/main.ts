import { createApp } from "./app.module";
import { logger } from "./common/utils/logger";

export async function bootstrap() {
	const app = createApp();
	const port = Number(process.env.PORT ?? 3000);

	const server = app.listen(port, () => {
		logger.info(`Server running on http://localhost:${port}`);
	});

	const shutdown = (signal: string) => {
		logger.info(`${signal} received, shutting down gracefully...`);
		server.close(() => {
			logger.info("Server closed");
			process.exit(0);
		});
	};

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));

	return server;
}
