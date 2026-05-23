export class RequiredUuidError extends Error {
	constructor(entity: string) {
		super(`[${entity}]: UUID value is required`);
		this.name = "required uuid error";
	}
}
