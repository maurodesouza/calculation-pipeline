import { NotFoundError } from "./not-found-error";

export class RunNotFoundError extends NotFoundError {
	constructor() {
		super("run");
		this.message = "[api]: run not found";
		this.name = "run not found error";
	}
}
