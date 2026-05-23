import { ValidationError } from "./validation-error";

export class InvalidUuidError extends ValidationError {
	constructor(entity: string) {
		super(`[${entity}]: Invalid UUID format`);
		this.name = "invalid uuid error";
	}
}
