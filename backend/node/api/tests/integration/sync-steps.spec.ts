import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SyncStepsUseCase } from "../../src/application/use-cases/sync-steps";
import { PipelineRepositoryDAO } from "../../src/infra/repository/pipeline";
import { StepRepositoryDAO } from "../../src/infra/repository/step";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { Container } from "../../src/infra/DI/container";
import { Pipeline } from "../../src/domain/entities/pipeline";
import { NotFoundError } from "../../src/domain/errors";
import { InvalidStateTransitionError } from "../../src/domain/errors";
import { UUID } from "../../src/domain/value-objects/uuid";

describe("SyncStepsUseCase Integration", () => {
	let pgAdapter: PGPromiseAdapter;
	let pipelineRepository: PipelineRepositoryDAO;
	let stepRepository: StepRepositoryDAO;
	let syncStepsUseCase: SyncStepsUseCase;

	beforeEach(async () => {
		pgAdapter = new PGPromiseAdapter();

		await pgAdapter.connect();

		pipelineRepository = new PipelineRepositoryDAO();
		stepRepository = new StepRepositoryDAO();
		syncStepsUseCase = new SyncStepsUseCase();

		const container = Container.getInstance();
		container.register("sql-connection", pgAdapter);
		container.register("pipeline-repository", pipelineRepository);
		container.register("step-repository", stepRepository);
		container.register("sync-steps-use-case", syncStepsUseCase);
	});

	afterEach(async () => {
		await pgAdapter.close();
	});

	it("should sync steps successfully", async () => {
		const [pipeline, createError] = Pipeline.create({
			name: "Test Pipeline",
			description: "A test pipeline",
		});
		expect(createError).toBeUndefined();

		const [, saveError] = await pipelineRepository.save(pipeline!);
		expect(saveError).toBeUndefined();

		// Initial sync - create 2 steps
		const id1 = UUID.create().getValue();
		const id2 = UUID.create().getValue();
		const id3 = UUID.create().getValue();

		const input1 = {
			pipelineId: pipeline!.getId(),
			steps: [
				{
					id: id1,
					name: "Step 1",
					operation: "sum",
					by: 10,
					nextStepId: id2,
				},
				{
					id: id2,
					name: "Step 2",
					operation: "multiply",
					by: 2,
				},
			],
		};

		const [result1, syncError1] = await syncStepsUseCase.execute(input1);
		expect(syncError1).toBeUndefined();
		expect(result1?.created).toBe(2);

		// Verify initial state
		const [steps1, fetchError1] = await stepRepository.getByPipelineId(pipeline!.getId());
		expect(fetchError1).toBeUndefined();
		expect(steps1?.length).toBe(2);

		// Second sync - update step 1, delete step 2, create step 3
		const input2 = {
			pipelineId: pipeline!.getId(),
			steps: [
				{
					id: id1,
					name: "Step 1 Updated",
					operation: "sum",
					by: 20,
					nextStepId: id3,
				},
				{
					id: id3,
					name: "Step 3",
					operation: "divide",
					by: 5,
				},
			],
		};

		const [result2, syncError2] = await syncStepsUseCase.execute(input2);
		expect(syncError2).toBeUndefined();
		expect(result2?.updated).toBe(1);
		expect(result2?.deleted).toBe(1);
		expect(result2?.created).toBe(1);

		// Verify final state
		const [steps2, fetchError2] = await stepRepository.getByPipelineId(pipeline!.getId());
		expect(fetchError2).toBeUndefined();
		expect(steps2?.length).toBe(2);

		const step1 = steps2?.find((s) => s.getId() === id1);
		expect(step1?.getName()).toBe("Step 1 Updated");
		expect(step1?.getBy()).toBe(20);

		const step3 = steps2?.find((s) => s.getId() === id3);
		expect(step3?.getName()).toBe("Step 3");
		expect(step3?.getOperation()).toBe("divide");

		const step2 = steps2?.find((s) => s.getId() === id2);
		expect(step2).toBeUndefined();
	});

	it("should return error when pipeline not found", async () => {
		const input = {
			pipelineId: UUID.create().getValue(),
			steps: [
				{
					id: UUID.create().getValue(),
					operation: "sum",
					by: 10,
				},
			],
		};

		const [, error] = await syncStepsUseCase.execute(input);

		console.log("error", error)

		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(NotFoundError);
	});

	it("should return error when step chain is invalid", async () => {
		const [pipeline, createError] = Pipeline.create({
			name: "Test Pipeline",
			description: "A test pipeline",
		});
		expect(createError).toBeUndefined();

		const [, saveError] = await pipelineRepository.save(pipeline!);
		expect(saveError).toBeUndefined();

		const id1 = UUID.create().getValue();
		const id2 = UUID.create().getValue();

		const input = {
			pipelineId: pipeline!.getId(),
			steps: [
				{
					id: id1,
					operation: "sum",
					by: 10,
					nextStepId: id2,
				},
				{
					id: id2,
					operation: "multiply",
					by: 2,
				},
			],
		};

		const [, error] = await syncStepsUseCase.execute(input);
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(InvalidStateTransitionError);
	});
});
