import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
	error: string;
};

export class RunFailedEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("run-failed");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
