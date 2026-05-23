import { describe, it, expect } from 'vitest';
import { InvalidOperationError } from '../../../src/domain/errors/invalid-operation-error';

describe('InvalidOperationError', () => {
	it('should create error with entity, operation and valid operations', () => {
		const error = new InvalidOperationError('step', 'invalid', ['sum', 'subtract', 'multiply', 'divide']);

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('invalid operation error');
		expect(error.message).toBe('[step]: invalid operation, valid operations are: "sum", "subtract", "multiply", "divide", received: "invalid"');
	});

	it('should be instance of Error', () => {
		const error = new InvalidOperationError('step', 'invalid', ['sum', 'subtract', 'multiply', 'divide']);

		expect(error instanceof Error).toBe(true);
	});
});
