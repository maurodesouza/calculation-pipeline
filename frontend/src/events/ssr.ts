export class SSE {
	source: EventSource | null = null;

	private processed: Set<string> = new Set();
	private queue: string[] = [];

	private maxIds = 5000;

	constructor(private events: typeof import("./index").events) {}

	setup(url: string) {
		this.source = new EventSource(url);

		this.source.onmessage = (message) => {
			const {
				event: { id, name },
				payload,
			} = JSON.parse(message.data);

			if (!name) return;
			if (id && !this.add(id))
				return console.info(
					`[sse]: duplicated "${name}" event detected. id: ${id}`,
				);

			this.events.emit(name, payload);
		};
	}

	close() {
		this.source?.close();
	}

	private add(id: string) {
		if (this.processed.has(id)) return false;

		this.processed.add(id);
		this.queue.push(id);

		if (this.queue.length > this.maxIds) {
			const oldest = this.queue.shift();
			if (oldest) {
				this.processed.delete(oldest);
			}
		}

		return true;
	}
}
