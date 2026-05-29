import { RunFinalizedEvent } from "../../../domain/events/run-finalized";
import { inject } from "../../../infra/DI/container";

export class RunFinalizedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(
			RunFinalizedEvent,
			async (event: RunFinalizedEvent) => {
				const payload = event.getPayload();
				await this.queue.publish("processor.randomize", payload, {
					routingKey: "run.finalized",
				});
			},
		);
	}
}
