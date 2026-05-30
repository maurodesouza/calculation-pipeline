import type { Queue } from "../../../application/queue/queue";
import type { CompleteRunUseCase } from "../../../application/use-cases/complete-run";
import { inject } from "../../../infra/DI/container";

type RunCompletedPayload = {
	runId: string;
	result: number;
};

export class RunCompletedConsumer {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("complete-run-use-case")
	private declare readonly completeRunUseCase: CompleteRunUseCase;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume(
			"api.run.completed",
			async (message: RunCompletedPayload) => {
				const { runId, result } = message;
				await this.completeRunUseCase.execute({ runId, result });
			},
		);
	}
}
