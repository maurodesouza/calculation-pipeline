import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
};

type ConstructorData = Omit<EventPayload, "eventId">;

export class RunPausedEvent extends Event<EventPayload> {
	constructor(private readonly data: ConstructorData) {
		super("run-paused");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
