import { PipelineRepository } from "../../infra/repository/pipeline";
import { inject } from "../../infra/DI/container";

type Input = string;

type Output = {
	id: string;
	name?: string;
	description?: string;
	initialStepId?: string;
	createdAt: Date;
	updatedAt: Date;
};

export class GetPipelineUseCase {
	@inject("pipeline-repository")
	declare private readonly pipelineRepository: PipelineRepository;

	async execute(input: Input): Promise<[Output, undefined] | [undefined, Error]> {
		const [pipeline, error] = await this.pipelineRepository.getById(input);
		if (error) return [undefined, error];

		const output: Output = {
			id: pipeline.getId(),
			name: pipeline.getName(),
			description: pipeline.getDescription(),
			initialStepId: pipeline.getInitialStepId(),
			createdAt: pipeline.getCreatedAt(),
			updatedAt: pipeline.getUpdatedAt(),
		};

		return [output, undefined];
	}
}
