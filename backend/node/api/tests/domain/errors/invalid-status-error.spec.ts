import { describe, it, expect } from 'vitest';
import { InvalidStatusError } from '../../../src/domain/errors/invalid-status-error';

describe('InvalidStatusError', () => {
	it('should create error with entity, status and valid statuses', () => {
		const error = new InvalidStatusError('run', 'invalid', ['pending', 'running', 'completed', 'failed']);

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('invalid status error');
		expect(error.message).toBe('[run]: invalid status, valid statuses are: "pending", "running", "completed", "failed", received: "invalid"');
	});

	it('should be instance of Error', () => {
		const error = new InvalidStatusError('run', 'invalid', ['pending', 'running', 'completed', 'failed']);

		expect(error instanceof Error).toBe(true);
	});
});
