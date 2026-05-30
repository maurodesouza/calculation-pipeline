import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
};

export class RunResumedEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("run-resumed");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
