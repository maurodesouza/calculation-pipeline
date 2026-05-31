import type { Queue } from "../../application/queue/queue";
import { RunNotFoundError } from "../../domain/errors";
import { inject } from "../../infra/DI/container";
import type { RunRepository } from "../../infra/repository/run";

type Input = {
	runId: string;
};

export class FinalizeRunUseCase {
	@inject("run-repository")
	private declare readonly runRepository: RunRepository;

	@inject("queue")
	private declare readonly queue: Queue;

	async execute(input: Input): Promise<[true, undefined] | [undefined, Error]> {
		const [run, error] = await this.runRepository.getById(input.runId);
		if (error) return [undefined, error];
		if (!run) return [undefined, new RunNotFoundError()];

		const [, finalizeError] = run.finalize();
		if (finalizeError) return [undefined, finalizeError];

		await this.queue.publish(
			"run.finalize-requested",
			{
				runId: input.runId,
			},
			{ headers: { realtime: true } },
		);

		return [true, undefined];
	}
}
