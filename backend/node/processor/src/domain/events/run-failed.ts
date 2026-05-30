import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
	error: string;
};

type ConstructorData = Omit<EventPayload, "eventId">;

export class RunFailedEvent extends Event<EventPayload> {
	constructor(private readonly data: ConstructorData) {
		super("run-failed");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
