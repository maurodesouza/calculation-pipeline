import type { Queue } from "../../../application/queue/queue";
import type { Processor } from "../../../domain/processor";
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
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume<RunCreatedPayload>(
			"node.processor.run.created",
			async (message) => {
				const { runId, payload, steps } = message;
				this.processor.initialize(runId, payload, steps);
			},
		);
	}
}
