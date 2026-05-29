import type { HTTPServer } from "../../application/http/http-server";
import type { CreateRunUseCase } from "../../application/use-cases/create-run";
import type { FinalizeRunUseCase } from "../../application/use-cases/finalize-run";
import type { PauseRunUseCase } from "../../application/use-cases/pause-run";
import type { ResumeRunUseCase } from "../../application/use-cases/resume-run";
import { inject } from "../../infra/DI/container";

export class RunController {
	@inject("http-server")
	private declare readonly httpServer: HTTPServer;

	@inject("create-run-use-case")
	private declare readonly createRunUseCase: CreateRunUseCase;

	@inject("pause-run-use-case")
	private declare readonly pauseRunUseCase: PauseRunUseCase;

	@inject("resume-run-use-case")
	private declare readonly resumeRunUseCase: ResumeRunUseCase;

	@inject("finalize-run-use-case")
	private declare readonly finalizeRunUseCase: FinalizeRunUseCase;

	constructor() {
		this.httpServer.route("post", "/runs", async (body) => {
			const [id, error] = await this.createRunUseCase.execute(body);
			if (error) return [undefined, error];

			return [{ data: { id }, status: 201 }, undefined];
		});

		this.httpServer.route("post", "/runs/:id/pause", async (_, params) => {
			const [, error] = await this.pauseRunUseCase.execute({
				runId: params.id,
			});
			if (error) return [undefined, error];

			return [{ data: { success: true }, status: 200 }, undefined];
		});

		this.httpServer.route("post", "/runs/:id/resume", async (_, params) => {
			const [, error] = await this.resumeRunUseCase.execute({
				runId: params.id,
			});
			if (error) return [undefined, error];

			return [{ data: { success: true }, status: 200 }, undefined];
		});

		this.httpServer.route("post", "/runs/:id/finalize", async (_, params) => {
			const [, error] = await this.finalizeRunUseCase.execute({
				runId: params.id,
			});
			if (error) return [undefined, error];

			return [{ data: { success: true }, status: 200 }, undefined];
		});
	}
}
