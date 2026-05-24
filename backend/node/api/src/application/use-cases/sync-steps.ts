import { Pipeline, StepInput } from "../../domain/entities/pipeline";
import { PipelineRepository } from "../../infra/repository/pipeline";
import { inject } from "../../infra/DI/container";

type Input = {
	pipelineId: string;
	steps: StepInput[];
};

type Output = {
	created: number;
	updated: number;
	deleted: number;
};

export class SyncStepsUseCase {
	@inject("pipeline-repository")
	declare private readonly pipelineRepository: PipelineRepository;

	async execute(input: Input): Promise<[Output, undefined] | [undefined, Error]> {
		const [pipeline, pipelineError] = await this.pipelineRepository.getById(input.pipelineId);
		if (pipelineError) return [undefined, pipelineError];

		const [chain, restoreError] = Pipeline.restoreSteps(pipeline, input.steps);
		if (restoreError) return [undefined, restoreError];

		const [, setStepsError] = pipeline.setSteps(chain);
		if (setStepsError) return [undefined, setStepsError];

		const [result, syncError] = await this.pipelineRepository.sync(pipeline);
		if (syncError) return [undefined, syncError];

		return [result, undefined];
	}
}
