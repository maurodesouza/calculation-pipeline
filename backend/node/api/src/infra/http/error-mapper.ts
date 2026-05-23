import { ValidationError } from "../../domain/errors/validation-error";
import { NotFoundError } from "../../domain/errors/not-found-error";
import { ConflictError } from "../../domain/errors/conflict-error";
import { DomainError } from "../../domain/errors/domain-error";

export class HttpErrorMapper {
	static toStatus(error: Error): number {
		if (error instanceof ValidationError) {
			return 400;
		}

		if (error instanceof NotFoundError) {
			return 404;
		}

		if (error instanceof ConflictError) {
			return 409;
		}

		if (error instanceof DomainError) {
			return 500;
		}

		return 500;
	}
}
