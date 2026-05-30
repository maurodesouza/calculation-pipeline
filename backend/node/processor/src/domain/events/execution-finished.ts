import { Event } from "./event";

type EventPayload = {
	eventId: string;
	runId: string;
	stepId: string;
	result?: number;
	error?: string;
};

export class ExecutionFinishedEvent extends Event<EventPayload> {
	constructor(payload: EventPayload) {
		super("ExecutionFinished");
		this.payload = payload;
	}

	private payload: EventPayload;

	getPayload(): EventPayload {
		return {
			...this.payload,
			eventId: this.eventId,
		};
	}
}
