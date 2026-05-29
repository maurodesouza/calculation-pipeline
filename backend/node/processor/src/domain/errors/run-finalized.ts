import { DomainError } from "./domain-error";

export class FinalizedError extends DomainError {
	constructor() {
		super("finalized error");
		this.name = "finalized error";
	}
}

export class RunFinalizedError extends FinalizedError {
	constructor() {
		super();
		this.message = "[processor]: run finalized early";
		this.name = "run finalized error";
	}
}
