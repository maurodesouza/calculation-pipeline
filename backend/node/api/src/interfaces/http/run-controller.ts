import { HTTPServer } from "../../application/http/http-server";
import { CreateRunUseCase } from "../../application/use-cases/create-run";
import { inject } from "../../infra/DI/container";

export class RunController {
	@inject("http-server")
	declare private readonly httpServer: HTTPServer;

	@inject("create-run-use-case")
	declare private readonly createRunUseCase: CreateRunUseCase;

	constructor() {
		this.httpServer.route("post", "/runs", async (body) => {
			const [id, error] = await this.createRunUseCase.execute(body);
			if (error) return [undefined, error];

			return [{ data: { id }, status: 201 }, undefined];
		});
	}
}
