import { RunCompletedEvent } from "../../../domain/events/run-completed";
import { inject } from "../../../infra/DI/container";

export class ExecutionCompletedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(
			RunCompletedEvent,
			async (event: RunCompletedEvent) => {
				const payload = event.getPayload();
				await this.queue.publish("processor.randomize", payload, {
					routingKey: "execution.completed",
				});
			},
		);
	}
}
