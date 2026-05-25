import { DomainError } from "./domain-error";

export class ConflictError extends DomainError {
	constructor() {
		super("conflict error");
		this.name = "conflict error";
	}
}

export class RunAlreadyExistsError extends ConflictError {
	constructor() {
		super();
		this.message = "[processor]: run already exists";
		this.name = "run already exists error";
	}
}
