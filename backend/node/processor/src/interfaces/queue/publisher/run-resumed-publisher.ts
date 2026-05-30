import type { Queue } from "../../../application/queue/queue";
import { RunResumedEvent } from "../../../domain/events/run-resumed";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class RunResumedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(RunResumedEvent, async (event: RunResumedEvent) => {
			const payload = event.getPayload();
			await this.queue.publish("run.resumed", payload);
		});
	}
}
