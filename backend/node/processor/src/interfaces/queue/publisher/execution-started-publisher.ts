import { RunStartedEvent } from "../../../domain/events/run-started";
import { inject } from "../../../infra/DI/container";

export class ExecutionStartedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(RunStartedEvent, async (event: RunStartedEvent) => {
			const payload = event.getPayload();
			await this.queue.publish("processor.randomize", payload, {
				routingKey: "execution.started",
			});
		});
	}
}
