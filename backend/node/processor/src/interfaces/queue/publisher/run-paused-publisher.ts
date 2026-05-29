import { RunPausedEvent } from "../../../domain/events/run-paused";
import { inject } from "../../../infra/DI/container";

export class RunPausedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(RunPausedEvent, async (event: RunPausedEvent) => {
			const payload = event.getPayload();
			await this.queue.publish("processor.randomize", payload, {
				routingKey: "run.paused",
			});
		});
	}
}
