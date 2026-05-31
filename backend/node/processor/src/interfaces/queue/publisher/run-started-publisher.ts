import type { Queue } from "../../../application/queue/queue";
import { RunStartedEvent } from "../../../domain/events/run-started";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class RunStartedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(RunStartedEvent, async (event: RunStartedEvent) => {
			const payload = event.getPayload();
			await this.queue.publish("run.started", payload, {
				headers: { realtime: true },
			});
		});
	}
}
