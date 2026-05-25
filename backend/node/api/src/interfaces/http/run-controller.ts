import type { HTTPServer } from "../../application/http/http-server";
import type { CreateRunUseCase } from "../../application/use-cases/create-run";
import { inject } from "../../infra/DI/container";

export class RunController {
	@inject("http-server")
	private declare readonly httpServer: HTTPServer;

	@inject("create-run-use-case")
	private declare readonly createRunUseCase: CreateRunUseCase;

	constructor() {
		this.httpServer.route("post", "/runs", async (body) => {
			const [id, error] = await this.createRunUseCase.execute(body);
			if (error) return [undefined, error];

			return [{ data: { id }, status: 201 }, undefined];
		});
	}
}
