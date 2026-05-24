import { ConflictError } from "./conflict-error";

export class StepInconsistencyError extends ConflictError {
	constructor(id: string) {
		super(`[step]: data inconsistency detected for step with id "${id}"`);
		this.name = "step inconsistency error";
	}
}
