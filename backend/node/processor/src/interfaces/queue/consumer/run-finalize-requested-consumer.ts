import type { Queue } from "../../../application/queue/queue";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

type RunFinalizePayload = {
	runId: string;
};

export class RunFinalizeRequestedConsumer {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume<RunFinalizePayload>(
			"processor.run.finalize-requested",
			async (message) => {
				const { runId } = message;
				void this.processor.finalize(runId);
			},
		);
	}
}
