import { Event } from "./event";

type EventPayload = {
	runId: string;
	stepId: string;
	operation: string;
	value: number;
	by: number;
}

export class ExecuteStepEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("execute-step");
	}

	getPayload(): EventPayload {
		return this.data
	}
}
