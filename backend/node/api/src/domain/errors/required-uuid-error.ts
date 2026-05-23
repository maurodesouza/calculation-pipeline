import { ValidationError } from "./validation-error";

export class RequiredUuidError extends ValidationError {
	constructor(entity: string) {
		super(`[${entity}]: UUID value is required`);
		this.name = "required uuid error";
	}
}
