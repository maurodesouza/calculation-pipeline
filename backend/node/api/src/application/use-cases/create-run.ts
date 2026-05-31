import type { Queue } from "../../application/queue/queue";
import { Run } from "../../domain/entities/run";
import { inject } from "../../infra/DI/container";
import type { PipelineRepository } from "../../infra/repository/pipeline";
import type { RunRepository } from "../../infra/repository/run";
import { RunCreatedMapper } from "../mappers/run-created-mapper";

type Input = {
	pipelineId: string;
	payload: number;
};

export class CreateRunUseCase {
	@inject("pipeline-repository")
	private declare readonly pipelineRepository: PipelineRepository;

	@inject("run-repository")
	private declare readonly runRepository: RunRepository;

	@inject("queue")
	private declare readonly queue: Queue;

	async execute(
		input: Input,
	): Promise<[string, undefined] | [undefined, Error]> {
		const [pipeline, pipelineError] = await this.pipelineRepository.getById(
			input.pipelineId,
		);
		if (pipelineError) return [undefined, pipelineError];

		const [run, createError] = Run.create(input);
		if (createError) return [undefined, createError];

		const [, saveError] = await this.runRepository.save(run);
		if (saveError) return [undefined, saveError];

		await this.queue.publish(
			"run.created",
			RunCreatedMapper.toPayload(run, pipeline),
			{ headers: { realtime: true } },
		);

		console.log("passsou????");

		return [run.getId(), undefined];
	}
}
