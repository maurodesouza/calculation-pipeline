import type { ServerResponse } from "node:http";

export class ClientRegistry {
	private clients: Set<ServerResponse> = new Set();

	add(res: ServerResponse): void {
		this.clients.add(res);
	}

	remove(res: ServerResponse): void {
		this.clients.delete(res);
	}

	emit(event: string, data: unknown): void {
		const payload = {
			event,
			payload: data,
		};

		const message = `data: ${JSON.stringify(payload)}\n\n`;

		for (const res of this.clients) {
			res.write(message);
		}
	}
}
