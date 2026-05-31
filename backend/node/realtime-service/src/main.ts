import { ClientRegistry } from "./domain/run-registry";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq/rabbitmq-adapter";
import { rabbitQMTopology } from "./infra/queue/rabbitmq/rabbitmq-topology";
import { createServer } from "./interfaces/http/server";
import { executionRequestedConsumer } from "./interfaces/queue/consumer/execution-requested-consumer";
import { runCompletedConsumer } from "./interfaces/queue/consumer/run-completed-consumer";
import { runFailedConsumer } from "./interfaces/queue/consumer/run-failed-consumer";
import { runFinalizedConsumer } from "./interfaces/queue/consumer/run-finalized-consumer";
import { runPausedConsumer } from "./interfaces/queue/consumer/run-paused-consumer";
import { runResumedConsumer } from "./interfaces/queue/consumer/run-resumed-consumer";
import { runStartedConsumer } from "./interfaces/queue/consumer/run-started-consumer";
import { stepFinishedConsumer } from "./interfaces/queue/consumer/step-finished-consumer";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();

	await queue.setup(rabbitQMTopology);

	const registry = new ClientRegistry();

	await Promise.all([
		runStartedConsumer(queue, registry),
		runFailedConsumer(queue, registry),
		runCompletedConsumer(queue, registry),
		executionRequestedConsumer(queue, registry),
		stepFinishedConsumer(queue, registry),
		runPausedConsumer(queue, registry),
		runResumedConsumer(queue, registry),
		runFinalizedConsumer(queue, registry),
	]);

	const server = createServer(registry);

	server.listen(3500, () => {
		console.log("🚀 realtime-service is running on port 3500");
	});
}

main();
