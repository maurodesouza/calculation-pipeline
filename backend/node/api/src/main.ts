import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";
import { Container } from "./infra/DI/container";
import { HttpAdapter } from "./infra/http/http-adapter";
import { PipelineRepositoryDAO } from "./infra/repository/pipeline";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { CreatePipelineUseCase } from "./application/use-cases/create-pipeline";
import { GetPipelineUseCase } from "./application/use-cases/get-pipeline";
import { SyncStepsUseCase } from "./application/use-cases/sync-steps";
import { HTTPInterfaces } from "./interfaces/http";

const PORT = 3000

async function api() {
	const httpServer = new HttpAdapter();
	const pgPromiseAdapter = new PGPromiseAdapter();
	const queue = new RabbitMQAdapter();

	await Promise.all([
		pgPromiseAdapter.connect(),
		queue.connect()
	]);


	const instance = Container.getInstance();

	instance.register("http-server", httpServer);
	instance.register("sql-connection", pgPromiseAdapter);
	instance.register("queue", queue);
	instance.register("pipeline-repository", new PipelineRepositoryDAO());
	instance.register("step-repository", new StepRepositoryDAO());

	instance.register("create-pipeline-use-case", new CreatePipelineUseCase());
	instance.register("get-pipeline-use-case", new GetPipelineUseCase());
	instance.register("sync-steps-use-case", new SyncStepsUseCase());

	HTTPInterfaces.initialize();

	httpServer.listen(PORT);
}

api()
