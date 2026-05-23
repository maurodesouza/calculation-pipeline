export class RequiredOperationError extends Error {
	constructor(entity: string) {
		super(`[${entity}]: operation is required`);
		this.name = "required operation error";
	}
}
