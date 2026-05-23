import { describe, it, expect } from 'vitest';
import { RequiredOperationError } from '../../../src/domain/errors/required-operation-error';

describe('RequiredOperationError', () => {
	it('should create error with entity', () => {
		const error = new RequiredOperationError('step');

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('required operation error');
		expect(error.message).toBe('[step]: operation is required');
	});

	it('should be instance of Error', () => {
		const error = new RequiredOperationError('step');

		expect(error instanceof Error).toBe(true);
	});
});
