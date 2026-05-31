import type { Queue } from "../../../application/queue/queue";
import { StepFinishedEvent } from "../../../domain/events/step-finished";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class StepFinishedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(
			StepFinishedEvent,
			async (event: StepFinishedEvent) => {
				const payload = event.getPayload();
				await this.queue.publish("step.finished", payload, {
					headers: { realtime: true },
				});
			},
		);
	}
}
