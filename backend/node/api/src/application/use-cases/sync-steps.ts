import { Step } from "../../domain/entities/step";
import { PipelineRepository } from "../../infra/repository/pipeline";
import { StepRepository } from "../../infra/repository/step";
import { inject } from "../../infra/DI/container";
import { validateStepChain } from "../../domain/validators/step-chain-validator";
import { StepInconsistencyError } from "../../domain/errors";

type StepInput = {
	id: string;
	name?: string;
	description?: string;
	operation: string;
	by: number;
	nextStepId?: string;
};

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

	@inject("step-repository")
	declare private readonly stepRepository: StepRepository;

	async execute(input: Input): Promise<[Output, undefined] | [undefined, Error]> {
		const [, pipelineError] = await this.pipelineRepository.getById(input.pipelineId);
		if (pipelineError) return [undefined, pipelineError];

		const [existingSteps, fetchError] = await this.stepRepository.getByPipelineId(input.pipelineId);
		if (fetchError) return [undefined, fetchError];

		const existingStepIds = new Set(existingSteps.map((s) => s.getId()));
		const inputStepIds = new Set(input.steps.map((s) => s.id));

		const toCreate: Step[] = [];
		const toUpdate: Step[] = [];
		const toDelete: Step[] = [];
		const chain: Step[] = [];

		for (const stepInput of input.steps) {
			if (existingStepIds.has(stepInput.id)) {
				const existingStep = existingSteps.find((s) => s.getId() === stepInput.id);
				if (!existingStep) return [undefined, new StepInconsistencyError(stepInput.id)];

				const [step, restoreError] = Step.restore({
					...stepInput,
					pipelineId: input.pipelineId,
					createdAt: existingStep.getCreatedAt(),
					updatedAt: new Date(),
				});
				if (restoreError) return [undefined, restoreError];
				toUpdate.push(step);
				chain.push(step);
			} else {
				const [step, createError] = Step.create({
					...stepInput,
					pipelineId: input.pipelineId,
				});
				if (createError) return [undefined, createError];
				toCreate.push(step);
				chain.push(step);
			}
		}

		for (const step of existingSteps) {
			if (!inputStepIds.has(step.getId())) {
				toDelete.push(step);
			}
		}

		const [, validationError] = validateStepChain(chain);
		if (validationError) return [undefined, validationError];

		const [result, syncError] = await this.stepRepository.sync(toCreate, toUpdate, toDelete);
		if (syncError) return [undefined, syncError];

		return [result, undefined];
	}
}
