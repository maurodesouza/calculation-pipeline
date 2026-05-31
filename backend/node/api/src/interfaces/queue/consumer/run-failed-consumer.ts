import type { Queue } from "../../../application/queue/queue";
import type { FailRunUseCase } from "../../../application/use-cases/fail-run";
import { inject } from "../../../infra/DI/container";

type RunFailedPayload = {
	runId: string;
	error: string;
};

export class RunFailedConsumer {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("fail-run-use-case")
	private declare readonly failRunUseCase: FailRunUseCase;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume("api.run.failed", async (message: RunFailedPayload) => {
			const { runId, error } = message;
			await this.failRunUseCase.execute({ runId, error });
		});
	}
}
