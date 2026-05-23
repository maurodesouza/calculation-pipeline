import { ValidationError } from "./validation-error";

export class InvalidStatusError extends ValidationError {
	constructor(entity: string, status: string, validStatuses: string[]) {
		super(`[${entity}]: invalid status, valid statuses are: "${validStatuses.join('", "')}", received: "${status}"`);
		this.name = "invalid status error";
	}
}
