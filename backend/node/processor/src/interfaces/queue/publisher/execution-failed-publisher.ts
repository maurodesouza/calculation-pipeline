import { inject } from "../../../infra/DI/container";
import { RunFailedEvent } from "../../../domain/events/run-failed";

export class ExecutionFailedPublisher {
	@inject("queue")
	declare private readonly queue: any

	@inject("processor")
	declare private readonly processor: any

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.processor.register(RunFailedEvent, async (event: RunFailedEvent) => {
			const payload = event.getPayload()
			await this.queue.publish("processor.randomize", payload, { routingKey: "execution.failed" })
		})
	}
}
