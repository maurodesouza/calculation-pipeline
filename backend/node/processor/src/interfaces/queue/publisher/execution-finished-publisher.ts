import type { Queue } from "../../../application/queue/queue";
import { ExecutionFinishedEvent } from "../../../domain/events/execution-finished";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class ExecutionFinishedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

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
