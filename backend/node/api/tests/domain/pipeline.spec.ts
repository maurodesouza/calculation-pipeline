import { describe, it, expect } from 'vitest';
import { Pipeline } from '../../src/domain/entities/pipeline';
import { UUID } from '../../src/domain/value-objects/uuid';
import { InvalidUuidError } from '../../src/domain/errors/invalid-uuid-error';
import { RequiredUuidError } from '../../src/domain/errors/required-uuid-error';

function expectSuccess<T>(
	result: [T | undefined, Error | undefined],
) {
	const [entity, error] = result;

	expect(error).toBeUndefined();
	expect(entity).toBeDefined();

	return entity!;
}

describe('Pipeline', () => {
	describe('create', () => {
		it('should create with valid data', () => {
			const input = {
				name: 'Test Pipeline',
				description: 'Test Description',
				initialStepId: UUID.create().getValue(),
			};

			const pipeline = expectSuccess(Pipeline.create(input));

			expect(pipeline.getId()).toBeDefined();
			expect(pipeline.getName()).toBe(input.name);
			expect(pipeline.getDescription()).toBe(input.description);
			expect(pipeline.getInitialStepId()).toBe(input.initialStepId);
		});

		it('should create with optional fields undefined', () => {
			const pipeline = expectSuccess(Pipeline.create({}));

			expect(pipeline.getName()).toBeUndefined();
			expect(pipeline.getDescription()).toBeUndefined();
			expect(pipeline.getInitialStepId()).toBeUndefined();
		});

		it('should fail with invalid initial step id', () => {
			const [, error] = Pipeline.create({
				initialStepId: 'invalid',
			});

			expect(error).toBeInstanceOf(InvalidUuidError);
		});
	});

	describe('restore', () => {
		it('should restore valid data', () => {
			const input = {
				id: UUID.create().getValue(),
				initialStepId: UUID.create().getValue(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const pipeline = expectSuccess(Pipeline.restore(input));

			expect(pipeline.getId()).toBe(input.id);
			expect(pipeline.getInitialStepId()).toBe(input.initialStepId);
		});

		it('should fail with invalid ids', () => {
			{
				const [, error] = Pipeline.restore({
					id: undefined as any,
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				expect(error).toBeInstanceOf(RequiredUuidError);
			}
			{
				const [, error] = Pipeline.restore({
					id: 'invalid',
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				expect(error).toBeInstanceOf(InvalidUuidError);
			}
			{
				const [, error] = Pipeline.restore({
					id: UUID.create().getValue(),
					initialStepId: 'invalid',
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				expect(error).toBeInstanceOf(InvalidUuidError);
			}
		});
	});
});
