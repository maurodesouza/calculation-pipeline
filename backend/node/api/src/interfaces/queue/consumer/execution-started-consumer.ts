import type { InitializeRunUseCase } from "../../../application/use-cases/initialize-run";
import { inject } from "../../../infra/DI/container";

type ExecutionStartedPayload = {
	runId: string;
};

export class ExecutionStartedConsumer {
	@inject("queue")
	private declare readonly queue: any;

	@inject("initialize-run-use-case")
	private declare readonly initializeRunUseCase: InitializeRunUseCase;

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.queue.consume(
			"api.execution.started",
			async (message: ExecutionStartedPayload) => {
				const { runId } = message;
				await this.initializeRunUseCase.execute({ runId });
			},
		);
	}
}
