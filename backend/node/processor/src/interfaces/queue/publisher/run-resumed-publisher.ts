import { RunResumedEvent } from "../../../domain/events/run-resumed";
import { inject } from "../../../infra/DI/container";

export class RunResumedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(RunResumedEvent, async (event: RunResumedEvent) => {
			const payload = event.getPayload();
			await this.queue.publish("processor.randomize", payload, {
				routingKey: "run.resumed",
			});
		});
	}
}
