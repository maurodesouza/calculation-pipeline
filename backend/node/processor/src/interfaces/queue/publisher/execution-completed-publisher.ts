import type { Queue } from "../../../application/queue/queue";
import { RunCompletedEvent } from "../../../domain/events/run-completed";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class ExecutionCompletedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

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
