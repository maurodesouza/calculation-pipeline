import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
};

export class RunFinalizedEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("run.finalized");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
