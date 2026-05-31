import type { Queue } from "../../../application/queue/queue";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

type ExecutionFinishedPayload = {
	runId: string;
	stepId: string;
	result?: number;
	error?: string;
};

export class ExecutionFinishedConsumer {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume<ExecutionFinishedPayload>(
			"processor.step.finished",
			async (message) => {
				const { runId, stepId, result, error } = message;
				this.processor.executed(runId, stepId, { result: result ?? 0, error });
			},
		);
	}
}
