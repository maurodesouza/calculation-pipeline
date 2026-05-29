import { InvalidStateTransitionError } from "../errors/invalid-state-transition-error";
import { InvalidStatusError } from "../errors/invalid-status-error";
import { RequiredPipelineIdError } from "../errors/required-pipeline-id-error";
import { UUID } from "../value-objects/uuid";

enum RUNS_STATUS {
	PENDING = "pending",
	RUNNING = "running",
	PAUSED = "paused",
	COMPLETED = "completed",
	FAILED = "failed",
}

type CreatePayload = {
	pipelineId: string;
	payload: number;
};

type RestorePayload = {
	id: string;
	pipelineId: string;
	payload: number;
	result?: number;
	status: string;
	error?: string;
	createdAt: Date;
	updatedAt: Date;
};

type ConstructorPayload = {
	id: UUID;
	pipelineId: UUID;
	payload: number;
	result?: number;
	status: RUNS_STATUS;
	error?: string;
	createdAt: Date;
	updatedAt: Date;
};

export class Run {
	private id: UUID;
	private pipelineId: UUID;
	private payload: number;
	private result?: number;
	private status: RUNS_STATUS;
	private error?: string;
	private createdAt: Date;
	private updatedAt: Date;

	private constructor(payload: ConstructorPayload) {
		this.id = payload.id;
		this.pipelineId = payload.pipelineId;
		this.payload = payload.payload;
		this.result = payload.result;
		this.status = payload.status;
		this.error = payload.error;
		this.createdAt = payload.createdAt;
		this.updatedAt = payload.updatedAt;
	}

	static create(payload: CreatePayload): [Run, undefined] | [undefined, Error] {
		const now = new Date();
		const id = UUID.create();

		if (!payload.pipelineId) {
			return [undefined, new RequiredPipelineIdError("run")];
		}

		const [pipelineId, pipelineIdError] = UUID.restore(payload.pipelineId);
		if (!!pipelineIdError) return [undefined, pipelineIdError];

		const objPayload: ConstructorPayload = {
			...payload,
			id,
			status: RUNS_STATUS.PENDING,
			pipelineId,
			createdAt: now,
			updatedAt: now,
		};

		return [new Run(objPayload), undefined];
	}

	static restore(
		payload: RestorePayload,
	): [Run, undefined] | [undefined, Error] {
		const [id, idError] = UUID.restore(payload.id);
		if (!!idError) return [undefined, idError];

		const [pipelineId, pipelineIdError] = UUID.restore(payload.pipelineId);
		if (!!pipelineIdError) return [undefined, pipelineIdError];

		if (!Run.validateStatus(payload.status)) {
			return [
				undefined,
				new InvalidStatusError(
					"run",
					payload.status,
					Object.values(RUNS_STATUS),
				),
			];
		}

		return [
			new Run({
				...payload,
				id,
				pipelineId,
				status: payload.status as RUNS_STATUS,
			}),
			undefined,
		];
	}

	initialize(): [true, undefined] | [false, Error] {
		if (this.status !== RUNS_STATUS.PENDING) {
			return [
				false,
				new InvalidStateTransitionError("run", this.status, "pending"),
			];
		}

		this.status = RUNS_STATUS.RUNNING;
		this.updatedAt = new Date();

		return [true, undefined];
	}

	complete(result: number): [true, undefined] | [false, Error] {
		if (this.status !== RUNS_STATUS.RUNNING) {
			return [
				false,
				new InvalidStateTransitionError("run", this.status, "running"),
			];
		}

		this.status = RUNS_STATUS.COMPLETED;
		this.result = result;
		this.updatedAt = new Date();

		return [true, undefined];
	}

	fail(error: string): [true, undefined] | [false, Error] {
		if (this.status !== RUNS_STATUS.RUNNING) {
			return [
				false,
				new InvalidStateTransitionError("run", this.status, "running"),
			];
		}

		this.status = RUNS_STATUS.FAILED;
		this.error = error;
		this.updatedAt = new Date();

		return [true, undefined];
	}

	pause(): [true, undefined] | [false, Error] {
		if (this.status !== RUNS_STATUS.RUNNING) {
			return [
				false,
				new InvalidStateTransitionError("run", this.status, "running"),
			];
		}

		this.status = RUNS_STATUS.PAUSED;
		this.updatedAt = new Date();

		return [true, undefined];
	}

	resume(): [true, undefined] | [false, Error] {
		if (this.status !== RUNS_STATUS.PAUSED) {
			return [
				false,
				new InvalidStateTransitionError("run", this.status, "paused"),
			];
		}

		this.status = RUNS_STATUS.RUNNING;
		this.updatedAt = new Date();

		return [true, undefined];
	}

	finalize(): [true, undefined] | [false, Error] {
		if (
			this.status !== RUNS_STATUS.RUNNING &&
			this.status !== RUNS_STATUS.PAUSED
		) {
			return [
				false,
				new InvalidStateTransitionError(
					"run",
					this.status,
					"running or paused",
				),
			];
		}

		return [true, undefined];
	}

	private static validateStatus(status: string) {
		return Object.values(RUNS_STATUS).includes(status as RUNS_STATUS);
	}

	getId() {
		return this.id.getValue();
	}

	getPipelineId() {
		return this.pipelineId.getValue();
	}

	getPayload() {
		return this.payload;
	}

	getResult() {
		return this.result;
	}

	getStatus() {
		return this.status;
	}

	getError() {
		return this.error;
	}

	getCreatedAt() {
		return this.createdAt;
	}

	getUpdatedAt() {
		return this.updatedAt;
	}
}
