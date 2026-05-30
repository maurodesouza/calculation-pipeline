import type { Queue } from "../../../application/queue/queue";
import { ExecuteStepEvent } from "../../../domain/events/execute-step";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

export class ExecutionRequestedPublisher {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.processor.register(
			ExecuteStepEvent,
			async (event: ExecuteStepEvent) => {
				const payload = event.getPayload();
				const routingKey = this.getRoutingKey(payload.operation);
				await this.queue.publish("processor.randomize", payload, {
					routingKey,
				});
			},
		);
	}

	private getRoutingKey(operation: string): string {
		switch (operation) {
			case "sum":
				return "execution.sum-requested";
			case "subtract":
				return "execution.subtraction-requested";
			case "multiply":
				return "execution.multiplication-requested";
			case "divide":
				return "execution.division-requested";
			default:
				return "execution.unknown-requested";
		}
	}
}
