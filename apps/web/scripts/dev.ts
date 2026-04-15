import { spawn } from "node:child_process";
import { createServer } from "node:net";

const preferredPort = Number(process.env.PORT ?? 3001);

async function isPortAvailable(port: number) {
	return await new Promise<boolean>((resolve) => {
		const server = createServer();

		server.once("error", () => {
			resolve(false);
		});

		server.listen(port, () => {
			server.close(() => {
				resolve(true);
			});
		});
	});
}

async function findAvailablePort(startPort: number) {
	for (let port = startPort; port < startPort + 50; port += 1) {
		if (await isPortAvailable(port)) {
			return port;
		}
	}

	throw new Error(`No available port found starting from ${startPort}`);
}

const port = await findAvailablePort(preferredPort);

if (port !== preferredPort) {
	console.log(`Port ${preferredPort} is busy, using ${port} instead.`);
}

const nextProcess = spawn("bunx", ["next", "dev", "--port", String(port)], {
	stdio: "inherit",
	cwd: process.cwd(),
});

nextProcess.on("exit", (exitCode) => {
	process.exit(exitCode ?? 0);
});
