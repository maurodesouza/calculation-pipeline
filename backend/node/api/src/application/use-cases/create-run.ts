import { Run } from "../../domain/entities/run";
import { PipelineRepository } from "../../infra/repository/pipeline";
import { RunRepository } from "../../infra/repository/run";
import { Queue } from "../../application/queue/queue";
import { inject } from "../../infra/DI/container";
import { RunCreatedMapper } from "../mappers/run-created-mapper";

type Input = {
	pipelineId: string;
	payload: number;
};

export class CreateRunUseCase {
	@inject("pipeline-repository")
	declare private readonly pipelineRepository: PipelineRepository;

	@inject("run-repository")
	declare private readonly runRepository: RunRepository;

	@inject("queue")
	declare private readonly queue: Queue;

	async execute(input: Input): Promise<[string, undefined] | [undefined, Error]> {
		const [pipeline, pipelineError] = await this.pipelineRepository.getById(input.pipelineId);
		if (pipelineError) return [undefined, pipelineError];

		const [run, createError] = Run.create(input);
		if (createError) return [undefined, createError];

		const [, saveError] = await this.runRepository.save(run);
		if (saveError) return [undefined, saveError];

		await this.queue.publish("api.randomize", RunCreatedMapper.toPayload(run, pipeline), { routingKey: "run.created" });

		return [run.getId(), undefined];
	}
}
