import { ValidationError } from "./validation-error";

export class InvalidOperationError extends ValidationError {
	constructor(entity: string, operation: string, validOperations: string[]) {
		super(
			`[${entity}]: invalid operation, valid operations are: "${validOperations.join('", "')}", received: "${operation}"`,
		);
		this.name = "invalid operation error";
	}
}
