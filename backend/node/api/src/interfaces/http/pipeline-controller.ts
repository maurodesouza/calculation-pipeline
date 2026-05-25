import type { HTTPServer } from "../../application/http/http-server";
import type { CreatePipelineUseCase } from "../../application/use-cases/create-pipeline";
import type { GetPipelineUseCase } from "../../application/use-cases/get-pipeline";
import type { ListPipelinesUseCase } from "../../application/use-cases/list-pipelines";
import type { SyncStepsUseCase } from "../../application/use-cases/sync-steps";
import { inject } from "../../infra/DI/container";

export class PipelineController {
	@inject("http-server")
	private declare readonly httpServer: HTTPServer;

	@inject("create-pipeline-use-case")
	private declare readonly createPipelineUseCase: CreatePipelineUseCase;

	@inject("get-pipeline-use-case")
	private declare readonly getPipelineUseCase: GetPipelineUseCase;

	@inject("list-pipelines-use-case")
	private declare readonly listPipelinesUseCase: ListPipelinesUseCase;

	@inject("sync-steps-use-case")
	private declare readonly syncStepsUseCase: SyncStepsUseCase;

	constructor() {
		this.httpServer.route("get", "/pipelines", async (_, __, queryParams) => {
			const [pipelines, error] = await this.listPipelinesUseCase.execute({
				page: queryParams.page ? Number(queryParams.page) : undefined,
				limit: queryParams.limit ? Number(queryParams.limit) : undefined,
				name: queryParams.name,
				id: queryParams.id,
				sortBy: queryParams.sortBy as "created_at" | "updated_at" | undefined,
			});
			if (error) return [undefined, error];

			return [{ data: pipelines, status: 200 }, undefined];
		});

		this.httpServer.route("post", "/pipelines", async (body) => {
			const [id, error] = await this.createPipelineUseCase.execute(body);
			if (error) return [undefined, error];

			return [{ data: { id }, status: 201 }, undefined];
		});

		this.httpServer.route("get", "/pipelines/:id", async (_, params) => {
			const [pipeline, error] = await this.getPipelineUseCase.execute(
				params.id,
			);
			if (error) return [undefined, error];

			return [{ data: pipeline, status: 200 }, undefined];
		});

		this.httpServer.route(
			"put",
			"/pipelines/:id/steps",
			async (body, params) => {
				const [result, error] = await this.syncStepsUseCase.execute({
					pipelineId: params.id,
					steps: body,
				});
				if (error) return [undefined, error];

				return [{ data: result, status: 200 }, undefined];
			},
		);
	}
}
