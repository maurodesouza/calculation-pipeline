import { Event } from "./event";

type EventPayload = {
	runId: string;
	stepId: string;
	result?: number;
	error?: string;
};

export class StepFinishedEvent extends Event<EventPayload> {
	constructor(payload: EventPayload) {
		super("StepFinished");
		this.payload = payload;
	}

	private payload: EventPayload;

	getPayload(): EventPayload {
		return this.payload;
	}
}
