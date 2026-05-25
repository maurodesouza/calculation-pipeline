import { Event } from "./event";

type EventPayload = {
	runId: string;
	result: number
}

export class RunCompletedEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("run-completed");
	}

	getPayload(): EventPayload {
		return this.data
	}
}
