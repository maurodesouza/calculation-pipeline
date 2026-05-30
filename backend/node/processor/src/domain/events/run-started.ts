import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
};
export class RunStartedEvent extends Event<EventPayload> {
	constructor(private readonly runId: string) {
		super("run-started");
	}

	getPayload(): EventPayload {
		return {
			runId: this.runId,
			eventId: this.eventId,
		};
	}
}
