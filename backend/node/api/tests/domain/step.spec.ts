import { describe, it, expect } from 'vitest';
import { Step } from '../../src/domain/entities/step';
import { UUID } from '../../src/domain/value-objects/uuid';
import { InvalidUuidError } from '../../src/domain/errors/invalid-uuid-error';
import { RequiredPipelineIdError } from '../../src/domain/errors/required-pipeline-id-error';
import { RequiredOperationError } from '../../src/domain/errors/required-operation-error';
import { InvalidOperationError } from '../../src/domain/errors/invalid-operation-error';
import { RequiredUuidError } from '../../src/domain/errors/required-uuid-error';

const VALID_CREATE_INPUT = {
	pipelineId: UUID.create().getValue(),
	nextStepId: UUID.create().getValue(),
	name: 'Test Step',
	description: 'Test Description',
	operation: 'sum' as const,
	by: 10,
};

const VALID_RESTORE_INPUT = {
	...VALID_CREATE_INPUT,
	id: UUID.create().getValue(),
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-02'),
};

function expectSuccess<T>(
	result: [T | undefined, Error | undefined],
) {
	const [entity, error] = result;

	expect(error).toBeUndefined();
	expect(entity).toBeDefined();

	return entity!;
}

describe('Step', () => {
	describe('create', () => {
		it('should create a step with valid data', () => {
			const step = expectSuccess(Step.create(VALID_CREATE_INPUT));

			expect(step.getId()).toBeDefined();
			expect(step.getNextStepId()).toBe(VALID_CREATE_INPUT.nextStepId);
			expect(step.getOperation()).toBe(VALID_CREATE_INPUT.operation);
			expect(step.getBy()).toBe(VALID_CREATE_INPUT.by);
		});

		it('should create a step without optional fields', () => {
			const pipelineId = UUID.create().getValue();
			const step = expectSuccess(Step.create({
				pipelineId,
				operation: 'sum',
				by: 10,
			}));

			expect(step.getName()).toBeUndefined();
			expect(step.getDescription()).toBeUndefined();
			expect(step.getNextStepId()).toBeUndefined();
		});

		it('should create a step with valid next step id', () => {
			const pipelineId = UUID.create().getValue();
			const nextStepId = UUID.create().getValue();
			const [step, error] = Step.create({
				pipelineId,
				operation: 'sum',
				by: 10,
				nextStepId,
			});

			expect(error).toBeUndefined();
			expect(step).toBeInstanceOf(Step);
			expect(step!.getNextStepId()).toBe(nextStepId);
		});

		it('should return error when pipeline id is invalid', () => {
			{
				const [step, error] = Step.create({
					pipelineId: '',
					operation: 'sum',
					by: 10,
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(RequiredPipelineIdError);
			}

			{
				const [step, error] = Step.create({
					pipelineId: 'invalid-uuid',
					operation: 'sum',
					by: 10,
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(InvalidUuidError);
			}
		});

		it('should return error when operation is invalid', () => {
			{
				const [step, error] = Step.create({
					pipelineId: UUID.create().getValue(),
					operation: '',
					by: 10,
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(RequiredOperationError);
			}
			{
				const [step, error] = Step.create({
					pipelineId: UUID.create().getValue(),
					operation: 'invalid',
					by: 10,
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(InvalidOperationError);
			}
		});

		it('should return error when next step id is invalid', () => {
			const pipelineId = UUID.create().getValue();
			const [step, error] = Step.create({
				pipelineId,
				operation: 'sum',
				by: 10,
				nextStepId: 'invalid-uuid',
			});

			expect(step).toBeUndefined();
			expect(error).toBeInstanceOf(InvalidUuidError);
		});
	});

	describe('restore', () => {
		it('should restore a step with valid data', () => {

			const step = expectSuccess(Step.restore(VALID_RESTORE_INPUT));

			expect(step!.getId()).toBe(VALID_RESTORE_INPUT.id);
			expect(step!.getOperation()).toBe(VALID_RESTORE_INPUT.operation);
			expect(step!.getBy()).toBe(VALID_RESTORE_INPUT.by);
		});

		it('should return error when id is invalid', () => {
			{
				const [step, error] = Step.restore({
					...VALID_RESTORE_INPUT,
					id: 'invalid-uuid',
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(InvalidUuidError);
			}
			{
				const [step, error] = Step.restore({
					...VALID_RESTORE_INPUT,
					id: undefined as any,
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(RequiredUuidError);
			}
		});

		it('should return error when pipeline id is invalid', () => {
			{
				const [step, error] = Step.restore({
					...VALID_RESTORE_INPUT,
					pipelineId: 'invalid-uuid',
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(InvalidUuidError);
			}
			{
				const [step, error] = Step.restore({
					...VALID_RESTORE_INPUT,
					pipelineId: undefined as any,
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(RequiredUuidError);
			}
		});

		it('should return error when operation is invalid', () => {
			{
				const [step, error] = Step.restore({
					...VALID_RESTORE_INPUT,
					operation: 'invalid',
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(InvalidOperationError);
			}
			{
				const [step, error] = Step.restore({
					...VALID_RESTORE_INPUT,
					operation: undefined as any,
				});

				expect(step).toBeUndefined();
				expect(error).toBeInstanceOf(RequiredOperationError);
			}
		});
	});
});
