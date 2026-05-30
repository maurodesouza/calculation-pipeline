import { Processor } from "./domain/processor";
import { Container } from "./infra/DI/container";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq/rabbitmq-adapter";
import { rabbitQMTopology } from "./infra/queue/rabbitmq/rabbitmq-topology";
import { Queue } from "./interfaces/queue";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();
	await queue.setup(rabbitQMTopology);

	const processor = new Processor();
	const instance = Container.getInstance();

	instance.register("processor", processor);
	instance.register("queue", queue);

	Queue.initialize();

	console.log("🚀 processor service is running...");
}

main();
