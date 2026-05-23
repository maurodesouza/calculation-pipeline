import { ValidationError } from "./validation-error";

export class RequiredPipelineIdError extends ValidationError {
	constructor(entity: string) {
		super(`[${entity}]: pipeline ID is required`);
		this.name = "required pipeline id error";
	}
}
