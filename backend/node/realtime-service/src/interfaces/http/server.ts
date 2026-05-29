import http from "node:http";
import type { ClientRegistry } from "../../domain/run-registry";

export function createServer(registry: ClientRegistry): http.Server {
	return http.createServer((req, res) => {
		if (req.url === "/events") {
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
				"Access-Control-Allow-Origin": "*",
			});

			res.write(": connected\n\n");

			registry.add(res);

			req.on("close", () => {
				registry.remove(res);
			});

			return;
		}

		res.writeHead(404);
		res.end();
	});
}
