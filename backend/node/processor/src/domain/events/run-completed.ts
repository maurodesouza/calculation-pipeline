import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
	result: number;
};

export class RunCompletedEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("run-completed");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
