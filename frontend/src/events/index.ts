import { EventBus } from "./event-bus";
import "./global";

export interface Events {
	on<T = any>(eventName: string, callback: (payload: T) => void): () => void;
	emit<T = any>(eventName: string, payload?: T): void;
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
				return (eventName: string, payload?: unknown) => {
					return eventBus.emit(eventName, payload);
				};
			}

			return createProxy([...path, prop]);
		},

		apply(_target, _thisArg, args: unknown[]) {
			const eventName = path.join(".");
			eventBus.emit(eventName, args[0]);
		},
	});
}

export const events = createProxy() as Events & Record<string, unknown>;
