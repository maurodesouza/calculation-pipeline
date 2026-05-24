import { NotFoundError } from "./not-found-error";

export class StepNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`[step]: step with id "${id}" not found`);
		this.name = "step not found error";
	}
}
