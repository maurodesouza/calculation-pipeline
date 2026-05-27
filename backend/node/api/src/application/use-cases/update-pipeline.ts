import { inject } from "../../infra/DI/container";
import type { PipelineRepository } from "../../infra/repository/pipeline";

type Input = {
	id: string;
	name?: string;
	description?: string;
	canvas?: string;
};

export class UpdatePipelineUseCase {
	@inject("pipeline-repository")
	private declare readonly pipelineRepository: PipelineRepository;

	async execute(
		input: Input,
	): Promise<[undefined, undefined] | [undefined, Error]> {
		const [pipeline, error] = await this.pipelineRepository.getById(input.id);
		if (error) return [undefined, error];

		if (input.name !== undefined) {
			pipeline.setName(input.name);
		}

		if (input.description !== undefined) {
			pipeline.setDescription(input.description);
		}

		if (input.canvas !== undefined) {
			const [, canvasError] = pipeline.setCanvas(input.canvas);
			if (canvasError) return [undefined, canvasError];
		}

		const [, saveError] = await this.pipelineRepository.update(pipeline);
		if (saveError) return [undefined, saveError];

		return [undefined, undefined];
	}
}
