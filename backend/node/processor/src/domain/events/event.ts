export abstract class Event<T = any> {
	constructor(private eventName: string) {}

	getEventName() {
		return this.eventName;
	}

	abstract getPayload(): T;
}
