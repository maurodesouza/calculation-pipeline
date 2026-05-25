import { Event } from "./event";

type EventPayload = {
	runId: string;
};
export class RunStartedEvent extends Event<EventPayload> {
	constructor(private readonly runId: string) {
		super("run-started");
	}

	getPayload(): EventPayload {
		return {
			runId: this.runId,
		};
	}
}
