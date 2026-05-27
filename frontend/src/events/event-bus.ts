type Listener = {
	callback: Callback;
};

export type Callback<TPayload = unknown> = (payload: TPayload) => void;

export type Unsubscribe = () => void;

export class EventBus {
	private listeners: Map<string, Listener[]> = new Map();

	on(event: string, callback: Callback): Unsubscribe {
		if (!this.listeners.has(event)) this.listeners.set(event, []);

		const listener = { callback };
		const listeners = this.listeners.get(event);
		if (listeners) listeners.push(listener);

		return () => this.off(event, callback);
	}

	emit(event: string, payload?: unknown): void {
		console.info(`events[emit]: ${event}`, payload);

		const listeners = this.listeners.get(event);
		if (!listeners) return;

		for (const listener of listeners) {
			listener.callback(payload);
		}
	}

	off(event: string, callback: Callback): void {
		const listeners = this.listeners.get(event);
		if (!listeners) return;

		const index = listeners.findIndex(
			(listener) => listener.callback === callback,
		);

		if (index !== -1) listeners.splice(index, 1);
		if (listeners.length === 0) this.listeners.delete(event);
	}
}
