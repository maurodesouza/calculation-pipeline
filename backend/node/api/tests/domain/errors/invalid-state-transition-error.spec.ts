import { describe, it, expect } from 'vitest';
import { InvalidStateTransitionError } from '../../../src/domain/errors/invalid-state-transition-error';

describe('InvalidStateTransitionError', () => {
	it('should create error with entity, current status and expected status', () => {
		const error = new InvalidStateTransitionError('run', 'completed', 'running');

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('invalid state transition error');
		expect(error.message).toBe('[run]: invalid state transition, current status is "completed", expected "running"');
	});

	it('should be instance of Error', () => {
		const error = new InvalidStateTransitionError('run', 'failed', 'running');

		expect(error instanceof Error).toBe(true);
	});
});
