import { RunRepository } from "../../infra/repository/run";
import { RunNotFoundError } from "../../domain/errors";
import { inject } from "../../infra/DI/container";

type Input = {
	runId: string;
	error: string;
};

export class FailRunUseCase {
	@inject("run-repository")
	declare private readonly runRepository: RunRepository;

	async execute(input: Input): Promise<[true, undefined] | [undefined, Error]> {
		const [run, error] = await this.runRepository.getById(input.runId);
		if (error) return [undefined, error];
		if (!run) return [undefined, new RunNotFoundError()];

		const [, failError] = run.fail(input.error);
		if (failError) return [undefined, failError];

		const [, saveError] = await this.runRepository.update(run);
		if (saveError) return [undefined, saveError];

		return [true, undefined];
	}
}
