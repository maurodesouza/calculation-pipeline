import { inject } from "../../../infra/DI/container";

type RunCreatedPayload = {
	runId: string;
	payload: number;
	steps: Array<{
		id: string;
		operation: string;
		by: number;
		nextStepId?: string;
	}>;
};

export class RunCreatedConsumer {
	@inject("queue")
	declare private readonly queue: any

	@inject("processor")
	declare private readonly processor: any

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.queue.consume("processor.run.created", async (message: RunCreatedPayload) => {
			const { runId, payload, steps } = message
			this.processor.initialize(runId, payload, steps)
		})
	}
}
