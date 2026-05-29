import { Event } from "./event";

type EventPayload = {
	runId: string;
};

export class RunPausedEvent extends Event<EventPayload> {
	constructor(private readonly data: EventPayload) {
		super("run-paused");
	}

	getPayload(): EventPayload {
		return this.data;
	}
}
