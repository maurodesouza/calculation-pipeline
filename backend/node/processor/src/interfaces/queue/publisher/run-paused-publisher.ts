import type { Queue } from "../../../application/queue/queue";
import { RunPausedEvent } from "../../../domain/events/run-paused";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class RunPausedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

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
