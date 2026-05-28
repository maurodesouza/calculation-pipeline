import { EventBus } from "./event-bus";
import "./global";
import type { EmitConfig, Sequence, SequenceConfig } from "./event-bus";

export interface Events {
	on<T = any>(eventName: string, callback: (payload: T) => void): () => void;
	emit<T = any>(eventName: string, payload?: T, config?: EmitConfig): void;
	sequence<T = any>(initialValue?: T, config?: SequenceConfig): Sequence<T>;

	subscribe(callback: () => void): () => void;
	isExecuting(eventName: string): boolean;

	[key: string]: unknown;
}

const eventBus = new EventBus();

function createProxy(path: string[] = []): unknown {
	return new Proxy(() => {}, {
		get(_target, prop: string) {
			if (prop === "on") {
				return (eventName: string, callback: (payload?: unknown) => void) => {
					return eventBus.on(eventName, callback);
				};
			}

			if (prop === "emit") {
				return (eventName: string, payload?: unknown, config?: EmitConfig) => {
					return eventBus.emit(eventName, payload, config);
				};
			}

			if (prop === "subscribe") {
				return (callback: () => void) => {
					return eventBus.subscribe(callback);
				};
			}

			if (prop === "isExecuting") {
				return (eventName: string) => {
					return eventBus.isExecuting(eventName);
				};
			}

			if (prop === "sequence") {
				return (initialValue?: unknown[], config?: SequenceConfig) => {
					return eventBus.sequence(initialValue ?? [], config);
				};
			}

			return createProxy([...path, prop]);
		},

		apply(_target, _thisArg, args: unknown[]) {
			const eventName = path.join(".");
			return eventBus.emit(eventName, args[0], args[1] as EmitConfig);
		},
	});
}

export const events = createProxy() as Events & Record<string, unknown>;
