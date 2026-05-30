import { CompleteRunUseCase } from "./application/use-cases/complete-run";
import { CreatePipelineUseCase } from "./application/use-cases/create-pipeline";
import { CreateRunUseCase } from "./application/use-cases/create-run";
import { FailRunUseCase } from "./application/use-cases/fail-run";
import { FinalizeRunUseCase } from "./application/use-cases/finalize-run";
import { GetPipelineUseCase } from "./application/use-cases/get-pipeline";
import { InitializeRunUseCase } from "./application/use-cases/initialize-run";
import { ListPipelinesUseCase } from "./application/use-cases/list-pipelines";
import { PauseRunUseCase } from "./application/use-cases/pause-run";
import { ResumeRunUseCase } from "./application/use-cases/resume-run";
import { SyncStepsUseCase } from "./application/use-cases/sync-steps";
import { UpdatePipelineUseCase } from "./application/use-cases/update-pipeline";
import { Container } from "./infra/DI/container";
import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";
import { HttpAdapter } from "./infra/http/http-adapter";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { PipelineRepositoryDAO } from "./infra/repository/pipeline";
import { RunRepositoryDAO } from "./infra/repository/run";
import { HTTPInterface } from "./interfaces/http";
import { QueueInterface } from "./interfaces/queue";

const PORT = 3000;

async function api() {
	const httpServer = new HttpAdapter();
	const pgPromiseAdapter = new PGPromiseAdapter();
	const queue = new RabbitMQAdapter();

	await Promise.all([pgPromiseAdapter.connect(), queue.connect()]);

	await Promise.all([
		//#region API QUEUES

		queue.setup("api.events", "processor.run.created", {
			type: "direct",
			routingKey: "run.created",
		}),
		queue.setup("api.events", "processor.run.pause-requested", {
			type: "direct",
			routingKey: "run.pause-requested",
		}),
		queue.setup("api.events", "processor.run.resume-requested", {
			type: "direct",
			routingKey: "run.resume-requested",
		}),
		queue.setup("api.events", "processor.run.finalize-requested", {
			type: "direct",
			routingKey: "run.finalize-requested",
		}),

		// Randomize

		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.created",
		}),
		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.pause-requested",
		}),
		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.resume-requested",
		}),
		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.finalize-requested",
		}),
		//#endregion

		//#region RUN ACTIONS QUEUES

		queue.setup("processor.events", "api.run.started", {
			type: "direct",
			routingKey: "run.started",
		}),
		queue.setup("processor.events", "api.run.failed", {
			type: "direct",
			routingKey: "run.failed",
		}),
		queue.setup("processor.events", "api.run.completed", {
			type: "direct",
			routingKey: "run.completed",
		}),
		//#endregion
	]);

	const instance = Container.getInstance();

	instance.register("http-server", httpServer);
	instance.register("sql-connection", pgPromiseAdapter);
	instance.register("queue", queue);
	instance.register("pipeline-repository", new PipelineRepositoryDAO());
	instance.register("run-repository", new RunRepositoryDAO());

	instance.register("create-pipeline-use-case", new CreatePipelineUseCase());
	instance.register("get-pipeline-use-case", new GetPipelineUseCase());
	instance.register("list-pipelines-use-case", new ListPipelinesUseCase());
	instance.register("update-pipeline-use-case", new UpdatePipelineUseCase());
	instance.register("sync-steps-use-case", new SyncStepsUseCase());
	instance.register("create-run-use-case", new CreateRunUseCase());
	instance.register("initialize-run-use-case", new InitializeRunUseCase());
	instance.register("complete-run-use-case", new CompleteRunUseCase());
	instance.register("fail-run-use-case", new FailRunUseCase());
	instance.register("finalize-run-use-case", new FinalizeRunUseCase());
	instance.register("pause-run-use-case", new PauseRunUseCase());
	instance.register("resume-run-use-case", new ResumeRunUseCase());

	HTTPInterface.initialize();
	QueueInterface.initialize();

	httpServer.listen(PORT);
}

api();
