import { HTTPServer } from "../../application/http/http-server";
import { CreatePipelineUseCase } from "../../application/use-cases/create-pipeline";
import { GetPipelineUseCase } from "../../application/use-cases/get-pipeline";
import { inject } from "../../infra/DI/container";

export class PipelineController {
	@inject("http-server")
	declare private readonly httpServer: HTTPServer

	@inject("create-pipeline-use-case")
	declare private readonly createPipelineUseCase: CreatePipelineUseCase

	@inject("get-pipeline-use-case")
	declare private readonly getPipelineUseCase: GetPipelineUseCase

	constructor() {
		this.httpServer.route("post", "/pipelines", async (body) => {
			const [id, error] = await this.createPipelineUseCase.execute(body)
			if (error) return [undefined, error]

			return [{ data: { id }, status: 201 }, undefined]
		})

		this.httpServer.route("get", "/pipelines/:id", async (_, params) => {
			const [pipeline, error] = await this.getPipelineUseCase.execute(params.id)
			if (error) return [undefined, error]

			return [{ data: pipeline, status: 200 }, undefined]
		})
	}
}
