import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CreateRunUseCase } from "../../src/application/use-cases/create-run";
import { PipelineRepositoryDAO } from "../../src/infra/repository/pipeline";
import { RunRepositoryDAO } from "../../src/infra/repository/run";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { Container } from "../../src/infra/DI/container";
import { Pipeline } from "../../src/domain/entities/pipeline";
import { NotFoundError } from "../../src/domain/errors";
import { UUID } from "../../src/domain/value-objects/uuid";
import { Queue } from "../../src/application/queue/queue";

const mockQueue: Queue = {
	connect: vi.fn(),
	setup: vi.fn(),
	publish: vi.fn(),
	consume: vi.fn(),
};

describe("create run use-case integration", () => {
	let pgAdapter: PGPromiseAdapter;
	let pipelineRepository: PipelineRepositoryDAO;
	let runRepository: RunRepositoryDAO;
	let createRunUseCase: CreateRunUseCase;

	beforeEach(async () => {
		pgAdapter = new PGPromiseAdapter();
		await pgAdapter.connect();

		pipelineRepository = new PipelineRepositoryDAO();
		runRepository = new RunRepositoryDAO();
		createRunUseCase = new CreateRunUseCase();

		const container = Container.getInstance();
		container.register("sql-connection", pgAdapter);
		container.register("pipeline-repository", pipelineRepository);
		container.register("run-repository", runRepository);
		container.register("queue", mockQueue);
		container.register("create-run-use-case", createRunUseCase);
	});

	afterEach(async () => {
		await pgAdapter.close();
		vi.clearAllMocks();
	});

	it("should create a run successfully", async () => {
		const [pipeline, createError] = Pipeline.create({
			name: "Test Pipeline",
			description: "A test pipeline",
		});
		expect(createError).toBeUndefined();

		const [, saveError] = await pipelineRepository.save(pipeline!);
		expect(saveError).toBeUndefined();

		const input = {
			pipelineId: pipeline!.getId(),
			payload: 100,
		};

		const [id, createRunError] = await createRunUseCase.execute(input);
		expect(createRunError).toBeUndefined();
		expect(id).toBeDefined();

		const [run, getError] = await runRepository.getById(id!);
		expect(getError).toBeUndefined();
		expect(run?.getPipelineId()).toBe(pipeline!.getId());
		expect(run?.getPayload()).toBe(100);
		expect(run?.getStatus()).toBe("pending");

		expect(mockQueue.publish).toHaveBeenCalledWith(
			"api.randomize",
			expect.objectContaining({
				runId: id,
				steps: expect.any(Array),
			}),
			{ routingKey: "run.created" }
		);
	});

	it("should return error when pipeline not found", async () => {
		const input = {
			pipelineId: UUID.create().getValue(),
			payload: 100,
		};

		const [, error] = await createRunUseCase.execute(input);
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(NotFoundError);
	});
});
