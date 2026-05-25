import type { FailRunUseCase } from "../../../application/use-cases/fail-run";
import { inject } from "../../../infra/DI/container";

type ExecutionFailedPayload = {
	runId: string;
	error: string;
};

export class ExecutionFailedConsumer {
	@inject("queue")
	private declare readonly queue: any;

	@inject("fail-run-use-case")
	private declare readonly failRunUseCase: FailRunUseCase;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume(
			"api.execution.failed",
			async (message: ExecutionFailedPayload) => {
				const { runId, error } = message;
				await this.failRunUseCase.execute({ runId, error });
			},
		);
	}
}
