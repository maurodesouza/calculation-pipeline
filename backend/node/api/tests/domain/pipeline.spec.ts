import { describe, it, expect } from 'vitest';
import { Pipeline } from '../../src/domain/entities/pipeline';
import { Step } from '../../src/domain/entities/step';
import { UUID } from '../../src/domain/value-objects/uuid';
import { InvalidCanvasError } from '../../src/domain/errors/invalid-canvas-error';
import { InvalidUuidError } from '../../src/domain/errors/invalid-uuid-error';
import { RequiredUuidError } from '../../src/domain/errors/required-uuid-error';
import { InvalidStateTransitionError } from '../../src/domain/errors';

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
			expect(pipeline.getCanvas()).toBe(JSON.stringify({}));
		});

		it('should fail with invalid initial step id', () => {
			const [, error] = Pipeline.create({
				initialStepId: 'invalid',
			});

			expect(error).toBeInstanceOf(InvalidUuidError);
		});

		it('should create with custom canvas', () => {
			const customCanvas = JSON.stringify({ nodes: [], edges: [] });
			const pipeline = expectSuccess(Pipeline.create({ canvas: customCanvas }));

			expect(pipeline.getCanvas()).toBe(customCanvas);
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

		it('should restore with valid canvas', () => {
			const input = {
				id: UUID.create().getValue(),
				canvas: JSON.stringify({ nodes: [], edges: [] }),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const pipeline = expectSuccess(Pipeline.restore(input));

			expect(pipeline.getId()).toBe(input.id);
			expect(pipeline.getCanvas()).toBe(input.canvas);
		});

		it('should fail with invalid canvas JSON', () => {
			const [, error] = Pipeline.restore({
				id: UUID.create().getValue(),
				canvas: 'invalid-json',
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			expect(error).toBeInstanceOf(InvalidCanvasError);
		});

		it('should use default canvas when not provided', () => {
			const input = {
				id: UUID.create().getValue(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const pipeline = expectSuccess(Pipeline.restore(input));

			expect(pipeline.getCanvas()).toBe(JSON.stringify({}));
		});
	});

	describe('validateStepChain', () => {
		it('should not return error for valid chains', () => {
			const pipelineId = UUID.create().getValue()
			const id1 = UUID.create().getValue()
			const id2 = UUID.create().getValue()
			const id3 = UUID.create().getValue()
			const id4 = UUID.create().getValue()

			const step1 = expectSuccess(Step.create({
				id: id1,
				pipelineId,
				operation: "sum",
				by: 10,
				nextStepId: id2,
			}));

			const step2 = expectSuccess(Step.create({
				id: id2,
				pipelineId,
				operation: "multiply",
				by: 2,
				nextStepId: id3,
			}));

			const step3 = expectSuccess(Step.create({
				id: id3,
				pipelineId,
				operation: "multiply",
				by: 2,
			}));

			const uniqueStep = expectSuccess(Step.create({
				id: id4,
				pipelineId,
				operation: "multiply",
				by: 2,
			}));

			{
				const [, error] = Pipeline.validateStepChain([step1!, step2!, step3!]);
				expect(error).toBeUndefined();
			}
			{
				const [, error] = Pipeline.validateStepChain([uniqueStep]);
				expect(error).toBeUndefined();
			}
			{
				const [, error] = Pipeline.validateStepChain([]);
				expect(error).toBeUndefined();
			}
		});

		it('should return error for invalid chains', () => {
			const pipelineId = UUID.create().getValue()
			const id1 = UUID.create().getValue()
			const id2 = UUID.create().getValue()
			const id3 = UUID.create().getValue()
			const id4 = UUID.create().getValue()
			const id5 = UUID.create().getValue()

			const step1 = expectSuccess(Step.create({
				id: id1,
				pipelineId,
				operation: "sum",
				by: 10,
				nextStepId: id2,
			}))

			const step2 = expectSuccess(Step.create({
				id: id2,
				pipelineId,
				operation: "multiply",
				by: 2,
				nextStepId: id3,
			}))

			const step3 = expectSuccess(Step.create({
				id: id3,
				pipelineId,
				operation: "sum",
				by: 10,
				nextStepId: id4,
			}))


			{
				const [, error] = Pipeline.validateStepChain([step1, step2, step3]);
				expect(error).toBeDefined();
				expect(error).toBeInstanceOf(InvalidStateTransitionError);
			}
			{
				const [, error] = Pipeline.validateStepChain([step1, step3]);
				expect(error).toBeDefined();
				expect(error).toBeInstanceOf(InvalidStateTransitionError);
			}
		});
	});

	describe('setSteps', () => {
		it('should set steps and update initialStepId', () => {
			const pipelineId = UUID.create().getValue()
			const id1 = UUID.create().getValue()
			const id2 = UUID.create().getValue()
			const id3 = UUID.create().getValue()

			const step1 = expectSuccess(Step.create({
				id: id1,
				pipelineId,
				operation: "sum",
				by: 10,
				nextStepId: id2,
			}));

			const step2 = expectSuccess(Step.create({
				id: id2,
				pipelineId,
				operation: "multiply",
				by: 2,
				nextStepId: id3,
			}));

			const step3 = expectSuccess(Step.create({
				id: id3,
				pipelineId,
				operation: "multiply",
				by: 2,
			}));

			const pipeline = expectSuccess(Pipeline.create({}));

			const [, error] = pipeline.setSteps([step1!, step2!, step3!]);
			expect(error).toBeUndefined();
			expect(pipeline.getInitialStepId()).toBe(id1);
		});

		it('should return error when chain is invalid', () => {
			const pipelineId = UUID.create().getValue()
			const id1 = UUID.create().getValue()
			const id2 = UUID.create().getValue()
			const id3 = UUID.create().getValue()

			const step1 = expectSuccess(Step.create({
				id: id1,
				pipelineId,
				operation: "sum",
				by: 10,
				nextStepId: id2,
			}));

			const step2 = expectSuccess(Step.create({
				id: id2,
				pipelineId,
				operation: "multiply",
				by: 2,
				nextStepId: id3,
			}));

			const pipeline = expectSuccess(Pipeline.create({}));

			const [, error] = pipeline.setSteps([step1!, step2!]);

			expect(error).toBeDefined();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
			expect(pipeline.getInitialStepId()).toBeUndefined()
		});

		describe('setCanvas', () => {
			it('should set valid canvas', () => {
				const pipeline = expectSuccess(Pipeline.create({}));
				const newCanvas = JSON.stringify({ nodes: [{ id: '1' }], edges: [] });

				const [, error] = pipeline.setCanvas(newCanvas);

				expect(error).toBeUndefined();
				expect(pipeline.getCanvas()).toBe(newCanvas);
			});

			it('should fail with invalid canvas JSON', () => {
				const pipeline = expectSuccess(Pipeline.create({}));

				const [, error] = pipeline.setCanvas('invalid-json');

				expect(error).toBeInstanceOf(InvalidCanvasError);
			});

			it('should update updatedAt when setting canvas', async () => {
				const pipeline = expectSuccess(Pipeline.create({}));
				const originalUpdatedAt = pipeline.getUpdatedAt();

				// Wait a bit to ensure timestamp difference
				await new Promise(resolve => setTimeout(resolve, 1));

				pipeline.setCanvas(JSON.stringify({ nodes: [] }));

				expect(pipeline.getUpdatedAt()).not.toBe(originalUpdatedAt);
			});
		});
	});
});
