import { DomainError } from "./domain-error";

export class NotFoundError extends DomainError {
	constructor() {
		super("not found error");
		this.name = "not found error";
	}
}

export class RunNotFoundError extends NotFoundError {
	constructor() {
		super();
		this.message = "[processor]: run not found";
		this.name = "run not found error";
	}
}

export class StepNotFoundError extends NotFoundError {
	constructor() {
		super();
		this.message = "[processor]: step not found";
		this.name = "step not found error";
	}
}
