import { describe, it, expect } from 'vitest';
import { RequiredUuidError } from '../../../src/domain/errors/required-uuid-error';

describe('RequiredUuidError', () => {
	it('should create error with entity', () => {
		const error = new RequiredUuidError('uuid');

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('required uuid error');
		expect(error.message).toBe('[uuid]: UUID value is required');
	});

	it('should be instance of Error', () => {
		const error = new RequiredUuidError('uuid');

		expect(error instanceof Error).toBe(true);
	});
});
