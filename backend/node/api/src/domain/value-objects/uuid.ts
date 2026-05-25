import { InvalidUuidError } from "../errors/invalid-uuid-error";
import { RequiredUuidError } from "../errors/required-uuid-error";

export class UUID {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create() {
		return new UUID(crypto.randomUUID());
	}

	static restore(value?: string): [UUID, undefined] | [undefined, Error] {
		const error = UUID.validate(value);

		if (!!error) return [undefined, error];
		return [new UUID(value!), undefined];
	}

	getValue(): string {
		return this.value;
	}

	private static validate(value?: string): Error | undefined {
		if (!value) return new RequiredUuidError("uuid");

		const isValid =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				value,
			);

		return isValid ? undefined : new InvalidUuidError("uuid");
	}
}
