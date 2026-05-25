import { RunNotFoundError } from "../../domain/errors";
import { inject } from "../../infra/DI/container";
import type { RunRepository } from "../../infra/repository/run";

type Input = {
	runId: string;
};

export class InitializeRunUseCase {
	@inject("run-repository")
	private declare readonly runRepository: RunRepository;

	async execute(input: Input): Promise<[true, undefined] | [undefined, Error]> {
		const [run, error] = await this.runRepository.getById(input.runId);
		if (error) return [undefined, error];
		if (!run) return [undefined, new RunNotFoundError()];

		const [, initError] = run.initialize();
		if (initError) return [undefined, initError];

		const [, saveError] = await this.runRepository.update(run);
		if (saveError) return [undefined, saveError];

		return [true, undefined];
	}
}
