import { inject } from "../../../infra/DI/container";
import { RunCompletedEvent } from "../../../domain/events/run-completed";

export class ExecutionCompletedPublisher {
	@inject("queue")
	declare private readonly queue: any

	@inject("processor")
	declare private readonly processor: any

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.processor.register(RunCompletedEvent, async (event: RunCompletedEvent) => {
			const payload = event.getPayload()
			await this.queue.publish("processor.randomize", payload, { routingKey: "execution.completed" })
		})
	}
}
