import { RunRepository } from "../../infra/repository/run";
import { RunNotFoundError } from "../../domain/errors";
import { inject } from "../../infra/DI/container";

type Input = {
	runId: string;
	result: number;
};

export class CompleteRunUseCase {
	@inject("run-repository")
	declare private readonly runRepository: RunRepository;

	async execute(input: Input): Promise<[true, undefined] | [undefined, Error]> {
		const [run, error] = await this.runRepository.getById(input.runId);
		if (error) return [undefined, error];
		if (!run) return [undefined, new RunNotFoundError()];

		const [, completeError] = run.complete(input.result);
		if (completeError) return [undefined, completeError];

		const [, saveError] = await this.runRepository.update(run);
		if (saveError) return [undefined, saveError];

		return [true, undefined];
	}
}
