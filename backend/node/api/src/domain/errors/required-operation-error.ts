import { ValidationError } from "./validation-error";

export class RequiredOperationError extends ValidationError {
	constructor(entity: string) {
		super(`[${entity}]: operation is required`);
		this.name = "required operation error";
	}
}
