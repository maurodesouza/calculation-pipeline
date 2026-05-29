import { StepFinishedEvent } from "../../../domain/events/step-finished";
import { inject } from "../../../infra/DI/container";

export class StepFinishedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(
			StepFinishedEvent,
			async (event: StepFinishedEvent) => {
				const payload = event.getPayload();
				await this.queue.publish("processor.randomize", payload, {
					routingKey: "step.finished",
				});
			},
		);
	}
}
