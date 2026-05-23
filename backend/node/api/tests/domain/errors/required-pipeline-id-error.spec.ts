import { describe, it, expect } from 'vitest';
import { RequiredPipelineIdError } from '../../../src/domain/errors/required-pipeline-id-error';

describe('RequiredPipelineIdError', () => {
	it('should create error with entity', () => {
		const error = new RequiredPipelineIdError('step');

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('required pipeline id error');
		expect(error.message).toBe('[step]: pipeline ID is required');
	});

	it('should be instance of Error', () => {
		const error = new RequiredPipelineIdError('step');

		expect(error instanceof Error).toBe(true);
	});
});
