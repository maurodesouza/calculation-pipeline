import { describe, it, expect } from 'vitest';
import { InvalidUuidError } from '../../../src/domain/errors/invalid-uuid-error';

describe('InvalidUuidError', () => {
	it('should create error with entity', () => {
		const error = new InvalidUuidError('uuid');

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('invalid uuid error');
		expect(error.message).toBe('[uuid]: Invalid UUID format');
	});

	it('should be instance of Error', () => {
		const error = new InvalidUuidError('uuid');

		expect(error instanceof Error).toBe(true);
	});
});
