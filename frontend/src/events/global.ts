export enum GlobalEvents {
	APP_INIT = "app.init",
	APP_READY = "app.ready",
}

declare module "#/events/index" {
	interface Events {
		app: {
			init: (payload?: unknown) => void;
			ready: (payload?: unknown) => void;
		};
	}
}
