export class InvalidStatusError extends Error {
	constructor(entity: string, status: string, validStatuses: string[]) {
		super(`[${entity}]: invalid status, valid statuses are: "${validStatuses.join('", "')}", received: "${status}"`);
		this.name = "invalid status error";
	}
}
