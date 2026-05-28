type Listener = {
	callback: Callback;
};

type Callback<TPayload = unknown, TResult = unknown> = (
	payload: TPayload,
) => TResult | Promise<TResult>;

export type Unsubscribe = () => void;

type TransitionKey = unknown[];

export type SequenceStep<T = unknown> = (input?: T | void) => Promise<T> | void;

export type SequenceConfig = {
	transition?: TransitionKey;
};

export type EmitConfig = {
	transition?: TransitionKey;
};

export class EventBus {
	private observers = new Set<() => void>();
	private listeners: Map<string, Listener[]> = new Map();
	private pending: Map<string, number> = new Map();

	on(event: string, callback: Callback): Unsubscribe {
		if (!this.listeners.has(event)) this.listeners.set(event, []);

		const listener = { callback };
		const listeners = this.listeners.get(event);
		if (listeners) listeners.push(listener);

		return () => this.off(event, callback);
	}

	async emit<TResult = unknown>(
		event: string,
		payload?: unknown,
		config?: EmitConfig,
	): Promise<TResult[]> {
		console.info(`events[emit]: ${event}`, payload);

		const transitionKey = config?.transition ? config.transition : [event];
		const serializedKey = this.serializeTransition(transitionKey);
		this.start(serializedKey);

		const listeners = this.listeners.get(event);
		if (!listeners) return [];

		try {
			const listeners = this.listeners.get(event);

			if (!listeners) return [];

			const results: TResult[] = [];

			for (const listener of listeners) {
				const result = await listener.callback(payload);

				results.push(result as TResult);
			}

			return results;
		} finally {
			this.end(serializedKey);
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

	sequence<T>(initial: T[], config?: SequenceConfig): Sequence<T> {
		const transitionKey = config?.transition ?? ["sequence"];

		const serializedKey = this.serializeTransition(transitionKey);

		return new Sequence(this, serializedKey, Promise.resolve(initial));
	}

	subscribe(observer: () => void) {
		this.observers.add(observer);

		return () => {
			this.observers.delete(observer);
		};
	}

	isExecuting(key: string) {
		return !!this.pending.get(key);
	}

	private notify() {
		for (const observer of this.observers) {
			observer();
		}
	}

	start(event: string) {
		this.pending.set(event, (this.pending.get(event) || 0) + 1);
		this.notify();
	}

	end(event: string) {
		const count = this.pending.get(event);

		if (count) this.pending.set(event, count - 1);
		else this.pending.delete(event);

		this.notify();
	}

	private serializeTransition(key: TransitionKey) {
		return JSON.stringify(key);
	}
}

export class Sequence<TCurrent> {
	constructor(
		private bus: EventBus,
		private transition: string,
		private value: Promise<TCurrent[]>,
	) {}

	step<TNext>(
		fn: (value: TCurrent[]) => Promise<TNext[]> | TNext[],
	): Sequence<TNext> {
		return new Sequence(this.bus, this.transition, this.value.then(fn));
	}

	async run(): Promise<TCurrent[]> {
		this.bus.start(this.transition);

		try {
			return await this.value;
		} finally {
			this.bus.end(this.transition);
		}
	}
}
