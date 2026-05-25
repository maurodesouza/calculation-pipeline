import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";
import { Container } from "./infra/DI/container";
import { HttpAdapter } from "./infra/http/http-adapter";
import { PipelineRepositoryDAO } from "./infra/repository/pipeline";
import { RunRepositoryDAO } from "./infra/repository/run";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { CreatePipelineUseCase } from "./application/use-cases/create-pipeline";
import { GetPipelineUseCase } from "./application/use-cases/get-pipeline";
import { SyncStepsUseCase } from "./application/use-cases/sync-steps";
import { CreateRunUseCase } from "./application/use-cases/create-run";
import { InitializeRunUseCase } from "./application/use-cases/initialize-run";
import { CompleteRunUseCase } from "./application/use-cases/complete-run";
import { FailRunUseCase } from "./application/use-cases/fail-run";
import { HTTPInterface } from "./interfaces/http";
import { QueueInterface } from "./interfaces/queue";

const PORT = 3000

async function api() {
	const httpServer = new HttpAdapter();
	const pgPromiseAdapter = new PGPromiseAdapter();
	const queue = new RabbitMQAdapter();

	await Promise.all([
		pgPromiseAdapter.connect(),
		queue.connect()
	]);

	await Promise.all([
		queue.setup("api.randomize", "randomizer", { type: "direct", routingKey: "run.created" }),
		queue.setup("api.events", "processor.run.created", { type: "direct", routingKey: "run.created" }),

		queue.setup("processor.events", "api.execution.started", { type: "direct", routingKey: "execution.started" }),
		queue.setup("processor.events", "api.execution.failed", { type: "direct", routingKey: "execution.failed" }),
		queue.setup("processor.events", "api.execution.completed", { type: "direct", routingKey: "execution.completed" })
	]);

	const instance = Container.getInstance();

	instance.register("http-server", httpServer);
	instance.register("sql-connection", pgPromiseAdapter);
	instance.register("queue", queue);
	instance.register("pipeline-repository", new PipelineRepositoryDAO());
	instance.register("run-repository", new RunRepositoryDAO());

	instance.register("create-pipeline-use-case", new CreatePipelineUseCase());
	instance.register("get-pipeline-use-case", new GetPipelineUseCase());
	instance.register("sync-steps-use-case", new SyncStepsUseCase());
	instance.register("create-run-use-case", new CreateRunUseCase());
	instance.register("initialize-run-use-case", new InitializeRunUseCase());
	instance.register("complete-run-use-case", new CompleteRunUseCase());
	instance.register("fail-run-use-case", new FailRunUseCase());

	HTTPInterface.initialize();
	QueueInterface.initialize();

	httpServer.listen(PORT);
}

api()
