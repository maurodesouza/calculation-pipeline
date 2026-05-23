import { UUID } from "../value-objects/uuid";

type CreatePayload = {
	name?: string;
	description?: string;
	initialStepId?: string;
};

type RestorePayload = {
	id: string;
	name?: string;
	description?: string;
	initialStepId?: string;
	createdAt: Date;
	updatedAt: Date;
};

type ConstructorPayload = {
	id: UUID;
	name?: string;
	description?: string;
	initialStepId?: UUID;
	createdAt: Date;
	updatedAt: Date;
};


export class Pipeline {
	private id: UUID;
	private name?: string;
	private description?: string;
	private initialStepId?: UUID;
	private createdAt: Date;
	private updatedAt: Date;

	constructor(
		payload: ConstructorPayload
	) {
		this.id = payload.id;
		this.name = payload.name;
		this.description = payload.description;
		this.initialStepId = payload.initialStepId;
		this.createdAt = payload.createdAt;
		this.updatedAt = payload.updatedAt;
	}

	static create(payload: CreatePayload): [Pipeline, undefined] | [undefined, Error] {
		const now = new Date();
		const id = UUID.create();

		const [stepId, stepIdError] = payload.initialStepId ? UUID.restore(payload.initialStepId) : [undefined, undefined];
		if (!!stepIdError) return [undefined, stepIdError];

		const objPayload: ConstructorPayload = {
			...payload,
			id,
			initialStepId: stepId,
			createdAt: now,
			updatedAt: now,
		};

		return [
			new Pipeline(objPayload),
			undefined
		];
	}

	static restore(payload: RestorePayload): [Pipeline, undefined] | [undefined, Error] {
		const [id, idError] = UUID.restore(payload.id);
		const [initialStepId, initialStepIdError] = payload.initialStepId ? UUID.restore(payload.initialStepId) : [undefined, undefined];

		if (!!idError) return [undefined, idError];
		if (!!initialStepIdError) return [undefined, initialStepIdError];

		return [
			new Pipeline({
				...payload,
				id,
				initialStepId,
			}),
			undefined
		];
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
}
