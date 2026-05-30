import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
	stepId: string;
	result?: number;
	error?: string;
};

type ConstructorData = Omit<EventPayload, "eventId">;

export class StepFinishedEvent extends Event<EventPayload> {
	constructor(private readonly data: ConstructorData) {
		super("step.finished");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
