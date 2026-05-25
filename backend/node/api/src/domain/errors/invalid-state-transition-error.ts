import { ConflictError } from "./conflict-error";

export class InvalidStateTransitionError extends ConflictError {
	constructor(entity: string, currentStatus: string, expectedStatus: string) {
		super(
			`[${entity}]: invalid state transition, current status is "${currentStatus}", expected "${expectedStatus}"`,
		);
		this.name = "invalid state transition error";
	}
}
