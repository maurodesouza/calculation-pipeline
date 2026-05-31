import type { Queue } from "../../application/queue/queue";
import { RunNotFoundError } from "../../domain/errors";
import { inject } from "../../infra/DI/container";
import type { RunRepository } from "../../infra/repository/run";

type Input = {
	runId: string;
};

export class ResumeRunUseCase {
	@inject("run-repository")
	private declare readonly runRepository: RunRepository;

	@inject("queue")
	private declare readonly queue: Queue;

	async execute(input: Input): Promise<[true, undefined] | [undefined, Error]> {
		const [run, error] = await this.runRepository.getById(input.runId);
		if (error) return [undefined, error];
		if (!run) return [undefined, new RunNotFoundError()];

		const [, resumeError] = run.resume();
		if (resumeError) return [undefined, resumeError];

		const [, saveError] = await this.runRepository.update(run);
		if (saveError) return [undefined, saveError];

		await this.queue.publish("run.resume-requested", {
			runId: input.runId,
		});

		return [true, undefined];
	}
}
