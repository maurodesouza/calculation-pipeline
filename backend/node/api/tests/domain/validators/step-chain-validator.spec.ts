import { describe, it, expect } from "vitest";
import { validateStepChain } from "../../../src/domain/validators/step-chain-validator";
import { Step } from "../../../src/domain/entities/step";
import { InvalidStateTransitionError } from "../../../src/domain/errors";
import { UUID } from "../../../src/domain/value-objects/uuid";

function expectSuccess<T>(
	result: [T | undefined, Error | undefined],
) {
	const [entity, error] = result;

	expect(error).toBeUndefined();
	expect(entity).toBeDefined();

	return entity!;
}

describe("validate step chain", () => {
	it("should not return error for valid chain", () => {
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
			const [, error] = validateStepChain([step1!, step2!, step3!]);
			expect(error).toBeUndefined();
		}
		{
			const [, error] = validateStepChain([step1!, step2!]);
			expect(error).toBeDefined();
			expect(error).toBeInstanceOf(InvalidStateTransitionError);
		}
		{
			const [, error] = validateStepChain([uniqueStep]);
			expect(error).toBeUndefined();
		}

	});

	it("should return error when last step has nextStepId", () => {
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
		}))

		const step2 = expectSuccess(Step.create({
			id: id2,
			pipelineId,
			operation: "multiply",
			by: 2,
			nextStepId: id3,
		}))

		const [, error] = validateStepChain([step1!, step2!]);
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(InvalidStateTransitionError);
	});

	it("should return error when nextStepId does not match next step id", () => {
		const pipelineId = UUID.create().getValue()
		const id1 = UUID.create().getValue()
		const id2 = UUID.create().getValue()
		const id3 = UUID.create().getValue()

		const step1 = expectSuccess(Step.create({
			id: id1,
			pipelineId,
			operation: "sum",
			by: 10,
			nextStepId: id3,
		}))

		const step2 = expectSuccess(Step.create({
			id: id2,
			pipelineId,
			operation: "multiply",
			by: 2,
		}))

		const [, error] = validateStepChain([step1!, step2!]);
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(InvalidStateTransitionError);
	});

});
