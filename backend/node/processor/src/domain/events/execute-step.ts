import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
	stepId: string;
	operation: string;
	value: number;
	by: number;
};

type ConstructorData = Omit<EventPayload, "eventId">;

export class ExecuteStepEvent extends Event<EventPayload> {
	constructor(private readonly data: ConstructorData) {
		super("execute-step");
	}

	getPayload(): EventPayload {
		return {
			...this.data,
			eventId: this.eventId,
		};
	}
}
