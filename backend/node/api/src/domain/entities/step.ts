import { UUID } from "../value-objects/uuid";
import { RequiredPipelineIdError } from "../errors/required-pipeline-id-error";
import { RequiredOperationError } from "../errors/required-operation-error";
import { InvalidOperationError } from "../errors/invalid-operation-error";

type CreatePayload = {
	name?: string;
	pipelineId: string;
	description?: string;
	nextStepId?: string;
	operation: string;
	by: number;
};

type RestorePayload = {
	id: string;
	pipelineId: string;
	name?: string;
	description?: string;
	nextStepId?: string;
	operation: string;
	by: number;
	createdAt: Date;
	updatedAt: Date;
};

type ConstructorPayload = {
	id: UUID;
	pipelineId: UUID;
	name?: string;
	description?: string;
	nextStepId?: UUID;
	operation: string;
	by: number;
	createdAt: Date;
	updatedAt: Date;
};

const VALID_OPERATIONS = ["sum", "subtract", "multiply", "divide"];

export class Step {
	private id: UUID;
	private name?: string;
	private description?: string;
	private nextStepId?: UUID;
	private operation: string;
	private by: number;
	private createdAt: Date;
	private updatedAt: Date;

	private constructor(
		payload: ConstructorPayload
	) {
		this.id = payload.id;
		this.name = payload.name;
		this.description = payload.description;
		this.nextStepId = payload.nextStepId;
		this.operation = payload.operation;
		this.by = payload.by;
		this.createdAt = payload.createdAt;
		this.updatedAt = payload.updatedAt;
	}

	static create(payload: CreatePayload): [Step, undefined] | [undefined, Error] {
		const now = new Date();
		const id = UUID.create();

		if (!payload.pipelineId) {
			return [undefined, new RequiredPipelineIdError('step')];
		}

		const operationValidation = Step.validateOperation(payload.operation);
		if (operationValidation) return [undefined, operationValidation];

		const [pipelineId, pipelineIdError] = UUID.restore(payload.pipelineId);
		if (!!pipelineIdError) return [undefined, pipelineIdError];

		const [stepId, stepIdError] = payload.nextStepId ? UUID.restore(payload.nextStepId) : [undefined, undefined];
		if (!!stepIdError) return [undefined, stepIdError];

		const objPayload: ConstructorPayload = {
			...payload,
			id,
			pipelineId,
			nextStepId: stepId,
			createdAt: now,
			updatedAt: now,
		};

		return [
			new Step(objPayload),
			undefined
		];
	}

	static restore(payload: RestorePayload): [Step, undefined] | [undefined, Error] {
		const [id, idError] = UUID.restore(payload.id);
		if (!!idError) return [undefined, idError];

		const [pipelineId, pipelineIdError] = UUID.restore(payload.pipelineId);
		if (!!pipelineIdError) return [undefined, pipelineIdError];

		const [nextStepId, nextStepIdError] = payload.nextStepId ? UUID.restore(payload.nextStepId) : [undefined, undefined];
		if (!!nextStepIdError) return [undefined, nextStepIdError];

		const operationValidation = Step.validateOperation(payload.operation);
		if (operationValidation) return [undefined, operationValidation];

		return [
			new Step({
				...payload,
				id,
				pipelineId,
				nextStepId,
			}),
			undefined
		];
	}

	private static validateOperation(operation: string): Error | undefined {
		if (!operation) {
			return new RequiredOperationError('step');
		}

		if (!VALID_OPERATIONS.includes(operation)) {
			return new InvalidOperationError('step', operation, VALID_OPERATIONS);
		}

		return undefined;
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

	getNextStepId() {
		return this.nextStepId?.getValue();
	}

	getOperation() {
		return this.operation;
	}

	getBy() {
		return this.by;
	}

	getCreatedAt() {
		return this.createdAt;
	}

	getUpdatedAt() {
		return this.updatedAt;
	}
}
