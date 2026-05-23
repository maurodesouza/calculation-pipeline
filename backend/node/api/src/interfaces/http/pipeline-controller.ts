import { HTTPServer } from "../../application/http/http-server";
import { CreatePipelineUseCase } from "../../application/use-cases/create-pipeline";
import { inject } from "../../infra/DI/container";

export class PipelineController {
	@inject("http-server")
	declare private readonly httpServer: HTTPServer

	@inject("create-pipeline-use-case")
	declare private readonly createPipelineUseCase: CreatePipelineUseCase

	constructor() {
		this.httpServer.route("post", "/pipelines", async (body) => {
			const [, error] = await this.createPipelineUseCase.execute(body)
			if (error) return [undefined, error]

			return [{ status: 204 }, undefined]
		})
	}
}
