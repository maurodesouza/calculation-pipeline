import { DomainError } from "./domain-error";

export class InvalidPayloadError extends DomainError {
	constructor() {
		super("invalid payload error");
		this.message = "[processor]: payload must be a number";
		this.name = "invalid payload error";
	}
}
