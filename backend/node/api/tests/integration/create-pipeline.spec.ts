
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CreatePipelineUseCase } from "../../src/application/use-cases/create-pipeline";
import { PipelineRepositoryDAO } from "../../src/infra/repository/pipeline";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { Container } from "../../src/infra/DI/container";
import { InvalidUuidError } from "../../src/domain/errors";

describe("create pipeline use-case integration", () => {
	let pgAdapter: PGPromiseAdapter;
	let pipelineRepository: PipelineRepositoryDAO;
	let createPipelineUseCase: CreatePipelineUseCase;

	beforeEach(async () => {
		pgAdapter = new PGPromiseAdapter();

		await pgAdapter.connect();

		pipelineRepository = new PipelineRepositoryDAO();
		createPipelineUseCase = new CreatePipelineUseCase();

		const container = Container.getInstance();
		container.register("sql-connection", pgAdapter);
		container.register("pipeline-repository", pipelineRepository);
		container.register("create-pipeline-use-case", createPipelineUseCase);
	});

	afterEach(async () => {
		await pgAdapter.close();
	});

	it("should create a pipeline successfully", async () => {
		const input = {
			name: "Test Pipeline",
			description: "A test pipeline",
		};

		const [id, createError] = await createPipelineUseCase.execute(input);
		expect(createError).toBeUndefined();

		const [pipeline, getError ] = await pipelineRepository.getById(id!);
		expect(getError).toBeUndefined();

		expect(pipeline?.getName()).toBe(input.name);
		expect(pipeline?.getDescription()).toBe(input.description);
	});

	it("should return error when initialStepId is not valid", async () => {
		const input = {
			initialStepId: "invalid-id",
		};

		const [, error] = await createPipelineUseCase.execute(input);
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(InvalidUuidError);
	});
});
