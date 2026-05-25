import { Pipeline } from "../../domain/entities/pipeline";
import { inject } from "../../infra/DI/container";
import type { PipelineRepository } from "../../infra/repository/pipeline";

type Input = {
	name?: string;
	description?: string;
	initialStepId?: string;
};

export class CreatePipelineUseCase {
	@inject("pipeline-repository")
	private declare readonly pipelineRepository: PipelineRepository;

	async execute(
		input: Input,
	): Promise<[string, undefined] | [undefined, Error]> {
		const [pipeline, error] = Pipeline.create(input);
		if (error) return [undefined, error];

		const [, saveError] = await this.pipelineRepository.save(pipeline);
		if (saveError) return [undefined, saveError];

		return [pipeline.getId(), undefined];
	}
}
