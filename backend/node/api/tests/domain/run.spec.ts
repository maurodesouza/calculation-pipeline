import { describe, it, expect } from 'vitest';
import { Run } from '../../src/domain/entities/run';
import { UUID } from '../../src/domain/value-objects/uuid';
import { InvalidUuidError } from '../../src/domain/errors/invalid-uuid-error';
import { RequiredPipelineIdError } from '../../src/domain/errors/required-pipeline-id-error';
import { RequiredUuidError } from '../../src/domain/errors/required-uuid-error';
import { InvalidStateTransitionError } from '../../src/domain/errors/invalid-state-transition-error';

function expectSuccess<T>(
	result: [T | undefined, Error | undefined],
) {
	const [entity, error] = result;

	expect(error).toBeUndefined();
	expect(entity).toBeDefined();

	return entity!;
}

const VALID_INPUT = {
	id: UUID.create().getValue(),
	pipelineId: UUID.create().getValue(),
	payload: 100,
	status: 'pending' as any,
	createdAt: new Date(),
	updatedAt: new Date(),
}

describe('Run', () => {
	describe('create', () => {
		it('should create a run with valid data', () => {
			const pipelineId = UUID.create().getValue();
			const run = expectSuccess(Run.create({
				pipelineId,
				payload: 100,
			}));

			expect(run!.getId()).toBeDefined();
			expect(run!.getPipelineId()).toBe(pipelineId);
			expect(run!.getPayload()).toBe(100);
			expect(run!.getStatus()).toBe('pending');
			expect(run!.getResult()).toBeUndefined();
			expect(run!.getError()).toBeUndefined();
		});

		it('should return error when pipeline id is invalid', () => {
			{
				const [, error] = Run.create({
					pipelineId: '',
					payload: 100,
				});

				expect(error).toBeInstanceOf(RequiredPipelineIdError);
			}

			{
				const [, error] = Run.create({
					pipelineId: 'invalid-uuid',
					payload: 100,
				});

				expect(error).toBeInstanceOf(InvalidUuidError);
			}
		});
	});

	describe('restore', () => {
		it('should restore a run with valid data', () => {
			const id = UUID.create().getValue();
			const pipelineId = UUID.create().getValue();
			const createdAt = new Date('2024-01-01');
			const updatedAt = new Date('2024-01-02');

			const run = expectSuccess(Run.restore({
				id,
				pipelineId,
				payload: 100,
				result: 200,
				status: 'completed' as any,
				error: undefined,
				createdAt,
				updatedAt,
			}));

			expect(run.getId()).toBe(id);
			expect(run.getPipelineId()).toBe(pipelineId);
		});

		it('should return error when id is invalid', () => {
			{
				const [, error] = Run.restore({
					...VALID_INPUT,
					id: 'invalid-uuid',
				});

				expect(error).toBeInstanceOf(InvalidUuidError);
			}
			{
				const [, error] = Run.restore({
					...VALID_INPUT,
					id: undefined as any,
				});

				expect(error).toBeInstanceOf(RequiredUuidError);
			}
		});

		it('should return error when pipeline id is invalid', () => {
			{
				const [, error] = Run.restore({
					...VALID_INPUT,
					pipelineId: 'invalid-uuid',
				});

				expect(error).toBeInstanceOf(InvalidUuidError);
			}
			{
				const [, error] = Run.restore({
					...VALID_INPUT,
					pipelineId: undefined as any,
				});

				expect(error).toBeInstanceOf(RequiredUuidError);
			}
		});
	});

	describe('state transitions', () => {
		it('should initialize run', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));

			expect(run.getStatus()).toBe('pending');
			const [success, error] = run.initialize();
			expect(error).toBeUndefined();
			expect(success).toBe(true);
			expect(run.getStatus()).toBe('running');
		});

		it('should not initialize when not pending', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));

			run.initialize();
			const [success, error] = run.initialize();

			expect(success).toBeFalsy();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		});

		it('should complete run with result', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));

			const [, initError] = run.initialize();
			expect(initError).toBeUndefined();
			const [success, error] = run.complete(200);
			expect(error).toBeUndefined();
			expect(success).toBe(true);
			expect(run.getStatus()).toBe('completed');
			expect(run.getResult()).toBe(200);
		});

		it('should fail run with error', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));
			const error = 'Test error';

			const [, initError] = run.initialize();
			expect(initError).toBeUndefined();
			const [success, errorResult] = run.fail(error);
			expect(errorResult).toBeUndefined();
			expect(success).toBe(true);
			expect(run.getStatus()).toBe('failed');
			expect(run.getError()).toBe(error);
		});

		it('should not complete when not running', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));
			const [success, error] = run.complete(200);

			expect(success).toBeFalsy();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		});

		it('should not complete when already completed', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));

			run.initialize();
			run.complete(200);

			const [success, error] = run.complete(300);

			expect(success).toBeFalsy();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		});

		it('should not complete when failed', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));

			run.initialize();
			run.fail('error');

			const [success, error] = run.complete(200);

			expect(success).toBeFalsy();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		});

		it('should not fail when not running', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));
			const [success, error] = run.fail('error');

			expect(success).toBeFalsy();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		});

		it('should not fail when already failed', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));

			run.initialize();
			run.fail('error1');

			const [success, error] = run.fail('error2');

			expect(success).toBeFalsy();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		});

		it('should not fail when completed', () => {
			const input = {
				pipelineId: VALID_INPUT.pipelineId,
				payload: VALID_INPUT.payload,
			};

			const run = expectSuccess(Run.create(input));

			run.initialize();
			run.complete(200);

			const [success, error] = run.fail('error');

			expect(success).toBeFalsy();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		});
	});
});
