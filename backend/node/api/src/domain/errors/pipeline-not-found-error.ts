import { NotFoundError } from "./not-found-error";

export class PipelineNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`[pipeline]: pipeline with id "${id}" not found`);
		this.name = "pipeline not found error";
	}
}
