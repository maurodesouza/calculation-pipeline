import { inject } from "../../../infra/DI/container";
import { CompleteRunUseCase } from "../../../application/use-cases/complete-run";

type ExecutionCompletedPayload = {
	runId: string;
	result: number;
};

export class ExecutionCompletedConsumer {
	@inject("queue")
	declare private readonly queue: any

	@inject("complete-run-use-case")
	declare private readonly completeRunUseCase: CompleteRunUseCase

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.queue.consume("api.execution.completed", async (message: ExecutionCompletedPayload) => {
			const { runId, result } = message
			await this.completeRunUseCase.execute({ runId, result })
		})
	}
}
