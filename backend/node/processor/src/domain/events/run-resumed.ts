import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
};

type ConstructorData = Omit<EventPayload, "eventId">;

export class RunResumedEvent extends Event<EventPayload> {
	constructor(private readonly data: ConstructorData) {
		super("run.resumed");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
