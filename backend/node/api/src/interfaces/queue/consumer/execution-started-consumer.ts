import { inject } from "../../../infra/DI/container";
import { InitializeRunUseCase } from "../../../application/use-cases/initialize-run";

type ExecutionStartedPayload = {
	runId: string;
};

export class ExecutionStartedConsumer {
	@inject("queue")
	declare private readonly queue: any

	@inject("initialize-run-use-case")
	declare private readonly initializeRunUseCase: InitializeRunUseCase

	constructor() {
		this.initialize()
	}

	private initialize() {
		this.queue.consume("api.execution.started", async (message: ExecutionStartedPayload) => {
			const { runId } = message
			await this.initializeRunUseCase.execute({ runId })
		})
	}
}
