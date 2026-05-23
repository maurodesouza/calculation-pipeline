import { PGPromiseAdapter } from "./infra/database/pg-promise-adapter";
import { Container } from "./infra/DI/container";
import { HttpAdapter } from "./infra/http/http-adapter";
import { PipelineRepositoryDAO } from "./infra/repository/pipeline";
import { CreatePipelineUseCase } from "./application/use-cases/create-pipeline";
import { GetPipelineUseCase } from "./application/use-cases/get-pipeline";
import { HTTPInterfaces } from "./interfaces/http";

const PORT = 3000

function api() {
	const httpServer = new HttpAdapter();
	const pgPromiseAdapter = new PGPromiseAdapter();

	pgPromiseAdapter.connect();

	const instance = Container.getInstance();

	instance.register("http-server", httpServer);
	instance.register("sql-connection", pgPromiseAdapter);
	instance.register("pipeline-repository", new PipelineRepositoryDAO());

	instance.register("create-pipeline-use-case", new CreatePipelineUseCase());
	instance.register("get-pipeline-use-case", new GetPipelineUseCase());

	HTTPInterfaces.initialize();

	httpServer.listen(PORT);
}

api()
