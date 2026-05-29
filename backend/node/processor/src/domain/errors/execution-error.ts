import { DomainError } from "./domain-error";

export class ExecutionError extends DomainError {
	constructor() {
		super("execution error");
		this.name = "execution error";
	}
}

export class StepExecutionError extends ExecutionError {
	constructor(error: string) {
		super();
		this.message = `[processor]: step failed: ${error}`;
		this.name = "step execution error";
	}
}

export class CannotResumeRunError extends ExecutionError {
	constructor() {
		super();
		this.message = `[processor]: cannot resume run: no previous result to continue from`;
		this.name = "cannot resume run error";
	}
}
