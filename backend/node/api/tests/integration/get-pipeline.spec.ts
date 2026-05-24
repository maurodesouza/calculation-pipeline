import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GetPipelineUseCase } from "../../src/application/use-cases/get-pipeline";
import { PipelineRepositoryDAO } from "../../src/infra/repository/pipeline";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { Container } from "../../src/infra/DI/container";
import { NotFoundError } from "../../src/domain/errors";
import { Pipeline } from "../../src/domain/entities/pipeline";
import { UUID } from "../../src/domain/value-objects/uuid";

function expectSuccess<T>(
	result: [T | undefined, Error | undefined],
) {
	const [entity, error] = result;

	expect(error).toBeUndefined();
	expect(entity).toBeDefined();

	return entity!;
}

describe("get pipeline use-case integration", () => {
	let pgAdapter: PGPromiseAdapter;
	let pipelineRepository: PipelineRepositoryDAO;
	let getPipelineUseCase: GetPipelineUseCase;

	beforeEach(async () => {
		pgAdapter = new PGPromiseAdapter();

		await pgAdapter.connect();

		pipelineRepository = new PipelineRepositoryDAO();
		getPipelineUseCase = new GetPipelineUseCase();

		const container = Container.getInstance();

		container.register("sql-connection", pgAdapter);
		container.register("pipeline-repository", pipelineRepository);
		container.register("get-pipeline-use-case", getPipelineUseCase);
	});

	afterEach(async () => {
		await pgAdapter.close();
	});

	it("should get a pipeline by id", async () => {
		const createInput = {
			name: "Test Pipeline",
			description: "A test pipeline",
		};

		const pipeline = expectSuccess(Pipeline.create(createInput));
		await pipelineRepository.save(pipeline);

		const [pipelineFromDb, getError] = await getPipelineUseCase.execute(pipeline.getId());

		expect(getError).toBeUndefined();
		expect(pipelineFromDb?.name).toBe(createInput.name);
		expect(pipelineFromDb?.description).toBe(createInput.description);
	});

	it.only("should return error when pipeline not found", async () => {
		const [, error] = await getPipelineUseCase.execute(UUID.create().getValue());
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(NotFoundError);
	});
});
