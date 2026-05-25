import { Event } from "./event";

type EventPayload = {
	runId: string;
	error: string
}

export class RunFailedEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("run-failed");
	}

	getPayload(): EventPayload {
		return this.data
	}
}
