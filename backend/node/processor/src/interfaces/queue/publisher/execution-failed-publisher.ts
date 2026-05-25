import { RunFailedEvent } from "../../../domain/events/run-failed";
import { inject } from "../../../infra/DI/container";

export class ExecutionFailedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(RunFailedEvent, async (event: RunFailedEvent) => {
			const payload = event.getPayload();
			await this.queue.publish("processor.randomize", payload, {
				routingKey: "execution.failed",
			});
		});
	}
}
