import { randomUUID } from "node:crypto";

export abstract class Event<T = any> {
	constructor(private eventName: string) {
		this.eventId = randomUUID();
	}

	protected readonly eventId: string;

	getEventName() {
		return this.eventName;
	}

	getEventId(): string {
		return this.eventId;
	}

	abstract getPayload(): T;
}
