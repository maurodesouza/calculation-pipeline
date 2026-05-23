export class InvalidOperationError extends Error {
	constructor(entity: string, operation: string, validOperations: string[]) {
		super(`[${entity}]: invalid operation, valid operations are: "${validOperations.join('", "')}", received: "${operation}"`);
		this.name = "invalid operation error";
	}
}
