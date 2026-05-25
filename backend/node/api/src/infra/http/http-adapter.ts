import * as http from "node:http";
import type {
	Callback,
	HTTPServer,
	Method,
} from "../../application/http/http-server";
import { HttpErrorMapper } from "./error-mapper";

type Route = {
	method: Method;
	url: string;
	callback: Callback<any, any, any, any>;
};

export class HttpAdapter implements HTTPServer {
	private server: http.Server;
	private routes: Route[] = [];

	constructor() {
		this.server = http.createServer(this.handle.bind(this));
	}

	route<R = any, T = any, P = any, Q = any>(
		method: Method,
		url: string,
		callback: Callback<R, T, P, Q>,
	): void {
		this.routes.push({ method, url, callback });
	}

	private async handle(
		request: http.IncomingMessage,
		response: http.ServerResponse,
	) {
		if (!request.url || !request.method) {
			response.writeHead(400);
			response.end();
			return;
		}

		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		);
		response.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization",
		);

		if (request.method === "OPTIONS") {
			response.writeHead(204);
			response.end();
			return;
		}

		const url = new URL(request.url, `http://${request.headers.host}`);

		const path = url.pathname;
		const method = request.method as Method;

		for (const route of this.routes) {
			if (
				route.method === method.toLocaleLowerCase() &&
				this.matchRoute(route.url, path)
			) {
				const pathParams = this.parsePathParams(route.url, path);
				const body = await this.parseBody(request);
				const queryParams = Object.fromEntries(url.searchParams.entries());

				try {
					const [result, error] = await route.callback(
						body,
						pathParams,
						queryParams,
					);

					if (error) {
						response.writeHead(HttpErrorMapper.toStatus(error));
						response.end(JSON.stringify({ error: error.message }));
						return;
					}

					response.writeHead(result.status);
					response.end(result.data ? JSON.stringify(result.data) : "");
					return;
				} catch (error) {
					response.writeHead(500);

					const errorMessage = (error as Error).message || "Unknown error";

					response.end(
						JSON.stringify({ error: `internal server error: ${errorMessage}` }),
					);
					return;
				}
			}
		}

		response.writeHead(404);
		response.end();
	}

	private matchRoute(pattern: string, path: string): boolean {
		const patternParts = pattern.split("/");
		const pathParts = path.split("/");

		if (patternParts.length !== pathParts.length) return false;

		for (let i = 0; i < patternParts.length; i++) {
			const patternPart = patternParts[i];
			const pathPart = pathParts[i];

			if (patternPart?.startsWith(":")) {
				continue;
			}

			if (patternPart !== pathPart) return false;
		}

		return true;
	}

	private parsePathParams(path: string, url: string) {
		const pathParts = path.split("/");
		const urlParts = url.split("/");

		if (pathParts.length !== urlParts.length) return {};

		const params: Record<string, string | undefined> = {};

		for (let i = 0; i < pathParts.length; i++) {
			const pathPart = pathParts[i];
			const urlPart = urlParts[i];

			if (pathPart?.startsWith(":")) {
				params[pathPart.slice(1)] = urlPart;
				continue;
			}

			if (pathPart !== urlPart) return {};
		}

		return params;
	}

	private parseBody(request: http.IncomingMessage) {
		return new Promise((resolve, reject) => {
			let body = "";

			request.on("data", (chunk) => {
				body += chunk.toString();
			});

			request.on("end", () => {
				try {
					resolve(body ? JSON.parse(body) : {});
				} catch (err) {
					reject(err);
				}
			});

			request.on("error", (error) => {
				reject(error);
			});
		});
	}

	listen(port: number): void {
		this.server.listen(port).on("listening", () => {
			console.log(`server running on port ${port}`);
		});
	}
}
