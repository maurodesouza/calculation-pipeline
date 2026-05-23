export class InvalidUuidError extends Error {
	constructor(entity: string) {
		super(`[${entity}]: Invalid UUID format`);
		this.name = "invalid uuid error";
	}
}
