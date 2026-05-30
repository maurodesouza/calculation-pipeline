import { ExecutionFinishedEvent } from "../../../domain/events/execution-finished";
import { inject } from "../../../infra/DI/container";

export class ExecutionFinishedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(
			ExecutionFinishedEvent,
			async (event: ExecutionFinishedEvent) => {
				const payload = event.getPayload();
				await this.queue.publish("processor.randomize", payload, {
					routingKey: "execution.finished",
				});
			},
		);
	}
}
