import type { CompleteRunUseCase } from "../../../application/use-cases/complete-run";
import { inject } from "../../../infra/DI/container";

type ExecutionCompletedPayload = {
	runId: string;
	result: number;
};

export class ExecutionCompletedConsumer {
	@inject("queue")
	private declare readonly queue: any;

	@inject("complete-run-use-case")
	private declare readonly completeRunUseCase: CompleteRunUseCase;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume(
			"api.execution.completed",
			async (message: ExecutionCompletedPayload) => {
				const { runId, result } = message;
				await this.completeRunUseCase.execute({ runId, result });
			},
		);
	}
}
