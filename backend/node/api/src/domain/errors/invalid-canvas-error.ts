import { ValidationError } from "./validation-error";

export class InvalidCanvasError extends ValidationError {
	constructor(canvas: string) {
		super(`Invalid canvas JSON: ${canvas}`);
		this.name = "InvalidCanvasError";
	}
}
