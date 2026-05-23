export class RequiredPipelineIdError extends Error {
	constructor(entity: string) {
		super(`[${entity}]: pipeline ID is required`);
		this.name = "required pipeline id error";
	}
}
