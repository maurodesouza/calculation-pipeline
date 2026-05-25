import { inject } from "../../../infra/DI/container";

type ExecutionFinishedPayload = {
	runId: string;
	result?: number;
	error?: string;
};

export class ExecutionFinishedConsumer {
	@inject("queue")
	declare private readonly queue: any

	@inject("processor")
	declare private readonly processor: any

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.queue.consume("processor.execution.finished", async (message: ExecutionFinishedPayload) => {
			const { runId, result, error } = message
			this.processor.executed(runId, { result, error })
		})
	}
}
