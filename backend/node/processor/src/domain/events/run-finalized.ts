import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
};

type ConstructorData = Omit<EventPayload, "eventId">;

export class RunFinalizedEvent extends Event<EventPayload> {
	constructor(private readonly data: ConstructorData) {
		super("run.finalized");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
