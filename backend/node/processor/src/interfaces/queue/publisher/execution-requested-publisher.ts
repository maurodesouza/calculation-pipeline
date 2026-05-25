import { ExecuteStepEvent } from "../../../domain/events/execute-step";
import { inject } from "../../../infra/DI/container";

export class ExecutionRequestedPublisher {
	@inject("queue")
	private declare readonly queue: any;

	@inject("processor")
	private declare readonly processor: any;

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
