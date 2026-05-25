import { inject } from "../../infra/DI/container";
import type { PipelineRepository } from "../../infra/repository/pipeline";

type Input = {
	page?: number;
	limit?: number;
	name?: string;
	id?: string;
	sortBy?: "created_at" | "updated_at";
};

type Data = {
	id: string;
	name?: string;
	description?: string;
	initialStepId?: string;
	createdAt: Date;
	updatedAt: Date;
};

type Output = {
	data: Data[];
	total: number;
	page: number;
	limit: number;
};

export class ListPipelinesUseCase {
	@inject("pipeline-repository")
	private declare readonly pipelineRepository: PipelineRepository;

	async execute(
		input: Input,
	): Promise<[Output, undefined] | [undefined, Error]> {
		const page = input.page || 1;
		const limit = input.limit || 10;
		const offset = (page - 1) * limit;

		const [pipelines, error] = await this.pipelineRepository.list({
			limit,
			offset,
			name: input.name,
			id: input.id,
			sortBy: input.sortBy || "created_at",
		});

		if (error) return [undefined, error];

		const [total, totalError] = await this.pipelineRepository.count({
			name: input.name,
			id: input.id,
		});

		if (totalError) return [undefined, totalError];

		const output: Output = {
			data: pipelines.map((pipeline) => ({
				id: pipeline.getId(),
				name: pipeline.getName(),
				description: pipeline.getDescription(),
				initialStepId: pipeline.getInitialStepId(),
				createdAt: pipeline.getCreatedAt(),
				updatedAt: pipeline.getUpdatedAt(),
			})),
			total,
			page,
			limit,
		};

		return [output, undefined];
	}
}
