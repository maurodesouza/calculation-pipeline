import type { Queue } from "../../../application/queue/queue";
import type { Processor } from "../../../domain/processor";
import { inject } from "../../../infra/DI/container";

type RunPausePayload = {
	runId: string;
};

export class RunPauseRequestedConsumer {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("processor")
	private declare readonly processor: Processor;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume<RunPausePayload>(
			"node.processor.run.pause-requested",
			async (message) => {
				const { runId } = message;
				this.processor.pause(runId);
			},
		);
	}
}
