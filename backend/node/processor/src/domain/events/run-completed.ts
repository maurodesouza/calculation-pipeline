import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
	result: number;
};

type ConstructorData = Omit<EventPayload, "eventId">;

export class RunCompletedEvent extends Event<EventPayload> {
	constructor(private readonly data: ConstructorData) {
		super("run-completed");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
