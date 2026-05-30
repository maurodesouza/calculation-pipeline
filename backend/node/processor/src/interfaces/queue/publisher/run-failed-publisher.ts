import type { Queue } from "../../../application/queue/queue";
import { RunFailedEvent } from "../../../domain/events/run-failed";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class RunFailedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(RunFailedEvent, async (event: RunFailedEvent) => {
			const payload = event.getPayload();
			await this.queue.publish("processor.randomize", payload, {
				routingKey: "run.failed",
			});
		});
	}
}
