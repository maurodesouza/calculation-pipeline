import type { Queue } from "../../../application/queue/queue";
import type { InitializeRunUseCase } from "../../../application/use-cases/initialize-run";
import { inject } from "../../../infra/DI/container";

type RunStartedPayload = {
	runId: string;
};

export class RunStartedConsumer {
	@inject("queue")
	private declare readonly queue: Queue;

	@inject("initialize-run-use-case")
	private declare readonly initializeRunUseCase: InitializeRunUseCase;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume(
			"api.run.started",
			async (message: RunStartedPayload) => {
				const { runId } = message;
				await this.initializeRunUseCase.execute({ runId });
			},
		);
	}
}
