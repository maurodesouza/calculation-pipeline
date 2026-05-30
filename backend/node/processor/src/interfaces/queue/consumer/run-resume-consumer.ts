import type { Queue } from "../../../application/queue/queue";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

type RunResumePayload = {
	runId: string;
};

export class RunResumeConsumer {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume(
			"processor.run.resume-requested",
			async (message: RunResumePayload) => {
				const { runId } = message;
				this.processor.resume(runId);
			},
		);
	}
}
