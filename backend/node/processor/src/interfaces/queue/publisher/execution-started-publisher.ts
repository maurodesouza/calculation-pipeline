import { inject } from "../../../infra/DI/container";
import { RunStartedEvent } from "../../../domain/events/run-started";

export class ExecutionStartedPublisher {
	@inject("queue")
	declare private readonly queue: any

	@inject("processor")
	declare private readonly processor: any

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.processor.register(RunStartedEvent, async (event: RunStartedEvent) => {
			const payload = event.getPayload()
			await this.queue.publish("processor.randomize", payload, { routingKey: "execution.started" })
		})
	}
}
