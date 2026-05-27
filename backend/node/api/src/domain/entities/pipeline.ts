import {
	InvalidCanvasError,
	InvalidStateTransitionError,
	StepInconsistencyError,
} from "../errors";
import { UUID } from "../value-objects/uuid";
import { Step } from "./step";

export type StepInput = {
	id: string;
	name?: string;
	description?: string;
	operation: string;
	by: number;
	nextStepId?: string;
};

type CreatePayload = {
	name?: string;
	description?: string;
	initialStepId?: string;
	canvas?: string;
};

type RestorePayload = {
	id: string;
	name?: string;
	description?: string;
	initialStepId?: string;
	steps?: Step[];
	canvas?: string;
	createdAt: Date;
	updatedAt: Date;
};

type ConstructorPayload = {
	id: UUID;
	name?: string;
	description?: string;
	initialStepId?: UUID;
	steps: Step[];
	canvas: string;
	createdAt: Date;
	updatedAt: Date;
};

export class Pipeline {
	private id: UUID;
	private name?: string;
	private description?: string;
	private initialStepId?: UUID;
	private steps: Step[];
	private canvas: string;
	private createdAt: Date;
	private updatedAt: Date;

	constructor(payload: ConstructorPayload) {
		this.id = payload.id;
		this.name = payload.name;
		this.description = payload.description;
		this.initialStepId = payload.initialStepId;
		this.steps = payload.steps || [];
		this.canvas = payload.canvas;
		this.createdAt = payload.createdAt;
		this.updatedAt = payload.updatedAt;
	}

	private static validateCanvas(
		canvas: string,
	): [undefined, undefined] | [undefined, Error] {
		try {
			JSON.parse(canvas);
		} catch {
			return [undefined, new InvalidCanvasError(canvas)];
		}
		return [undefined, undefined];
	}

	static create(
		payload: CreatePayload,
	): [Pipeline, undefined] | [undefined, Error] {
		const now = new Date();
		const id = UUID.create();

		const [stepId, stepIdError] = payload.initialStepId
			? UUID.restore(payload.initialStepId)
			: [undefined, undefined];
		if (!!stepIdError) return [undefined, stepIdError];

		const canvas = payload.canvas || JSON.stringify({});

		const [, canvasError] = Pipeline.validateCanvas(canvas);
		if (canvasError) return [undefined, canvasError];

		const objPayload: ConstructorPayload = {
			...payload,
			id,
			initialStepId: stepId,
			steps: [],
			canvas,
			createdAt: now,
			updatedAt: now,
		};

		return [new Pipeline(objPayload), undefined];
	}

	static restore(
		payload: RestorePayload,
	): [Pipeline, undefined] | [undefined, Error] {
		const [id, idError] = UUID.restore(payload.id);
		const [initialStepId, initialStepIdError] = payload.initialStepId
			? UUID.restore(payload.initialStepId)
			: [undefined, undefined];

		if (!!idError) return [undefined, idError];
		if (!!initialStepIdError) return [undefined, initialStepIdError];

		const canvas = payload.canvas || JSON.stringify({});

		const [, canvasError] = Pipeline.validateCanvas(canvas);
		if (canvasError) return [undefined, canvasError];

		return [
			new Pipeline({
				...payload,
				id,
				initialStepId,
				steps: payload.steps || [],
				canvas,
			}),
			undefined,
		];
	}

	static validateStepChain(
		steps: Step[],
	): [undefined, undefined] | [undefined, Error] {
		for (let i = 0; i < steps.length; i++) {
			const currentStep = steps[i]!;
			const isLastStep = i === steps.length - 1;

			if (isLastStep) {
				if (currentStep.getNextStepId()) {
					return [
						undefined,
						new InvalidStateTransitionError(
							"step",
							"undefined",
							"last step should not have nextStepId",
						),
					];
				}
				continue;
			}

			const nextStep = steps[i + 1]!;

			if (currentStep.getNextStepId() !== nextStep.getId()) {
				return [
					undefined,
					new InvalidStateTransitionError(
						"step",
						currentStep.getNextStepId() || "undefined",
						nextStep.getId(),
					),
				];
			}
		}

		return [undefined, undefined];
	}

	static restoreSteps(
		pipeline: Pipeline,
		stepInputs: StepInput[],
	): [Step[], undefined] | [undefined, Error] {
		const existingStepIds = new Set(pipeline.getSteps().map((s) => s.getId()));
		const chain: Step[] = [];
		const pipelineId = pipeline.getId();

		for (const stepInput of stepInputs) {
			if (existingStepIds.has(stepInput.id)) {
				const existingStep = pipeline
					.getSteps()
					.find((s) => s.getId() === stepInput.id);
				if (!existingStep)
					return [undefined, new StepInconsistencyError(stepInput.id)];

				const [step, restoreError] = Step.restore({
					...stepInput,
					pipelineId,
					createdAt: existingStep.getCreatedAt(),
					updatedAt: new Date(),
				});
				if (restoreError) return [undefined, restoreError];
				chain.push(step);
			} else {
				const [step, createError] = Step.create({
					...stepInput,
					pipelineId,
				});
				if (createError) return [undefined, createError];
				chain.push(step);
			}
		}

		return [chain, undefined];
	}

	setInitialStepId(
		initialStepId?: string,
	): [undefined, undefined] | [undefined, Error] {
		if (initialStepId) {
			const [id, error] = UUID.restore(initialStepId);
			if (error) return [undefined, error];
			this.initialStepId = id;
		} else {
			this.initialStepId = undefined;
		}
		this.updatedAt = new Date();
		return [undefined, undefined];
	}

	setName(name?: string): void {
		this.name = name;
		this.updatedAt = new Date();
	}

	setDescription(description?: string): void {
		this.description = description;
		this.updatedAt = new Date();
	}

	setSteps(steps: Step[]): [undefined, undefined] | [undefined, Error] {
		const [, validationError] = Pipeline.validateStepChain(steps);
		if (validationError) return [undefined, validationError];

		this.steps = steps;
		this.initialStepId = steps[0]
			? UUID.restore(steps[0].getId())[0]
			: undefined;
		this.updatedAt = new Date();
		return [undefined, undefined];
	}

	getId() {
		return this.id.getValue();
	}

	getName() {
		return this.name;
	}

	getDescription() {
		return this.description;
	}

	getInitialStepId() {
		return this.initialStepId?.getValue();
	}

	getCreatedAt() {
		return this.createdAt;
	}

	getUpdatedAt() {
		return this.updatedAt;
	}

	getSteps() {
		return this.steps;
	}

	getCanvas() {
		return this.canvas;
	}

	setCanvas(canvas: string): [undefined, undefined] | [undefined, Error] {
		const [, canvasError] = Pipeline.validateCanvas(canvas);
		if (canvasError) return [undefined, canvasError];

		this.canvas = canvas;
		this.updatedAt = new Date();
		return [undefined, undefined];
	}
}
