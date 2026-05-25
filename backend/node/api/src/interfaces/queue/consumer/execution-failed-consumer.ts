import { inject } from "../../../infra/DI/container";
import { FailRunUseCase } from "../../../application/use-cases/fail-run";

type ExecutionFailedPayload = {
	runId: string;
	error: string;
};

export class ExecutionFailedConsumer {
	@inject("queue")
	declare private readonly queue: any

	@inject("fail-run-use-case")
	declare private readonly failRunUseCase: FailRunUseCase

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.queue.consume("api.execution.failed", async (message: ExecutionFailedPayload) => {
			const { runId, error } = message
			await this.failRunUseCase.execute({ runId, error })
		})
	}
}
