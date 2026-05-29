import { ClientRegistry } from "./domain/run-registry";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { createServer } from "./interfaces/http/server";
import { executionCompletedConsumer } from "./interfaces/queue/consumer/execution-completed-consumer";
import { executionFailedConsumer } from "./interfaces/queue/consumer/execution-failed-consumer";
import { executionRequestedConsumer } from "./interfaces/queue/consumer/execution-requested-consumer";
import { executionStartedConsumer } from "./interfaces/queue/consumer/execution-started-consumer";
import { runFinalizedConsumer } from "./interfaces/queue/consumer/run-finalized-consumer";
import { runPausedConsumer } from "./interfaces/queue/consumer/run-paused-consumer";
import { runResumedConsumer } from "./interfaces/queue/consumer/run-resumed-consumer";
import { stepFinishedConsumer } from "./interfaces/queue/consumer/step-finished-consumer";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();

	await Promise.all([
		queue.setup("processor.events", "realtime.execution.started", {
			type: "direct",
			routingKey: "execution.started",
		}),
		queue.setup("processor.events", "realtime.execution.failed", {
			type: "direct",
			routingKey: "execution.failed",
		}),
		queue.setup("processor.events", "realtime.execution.completed", {
			type: "direct",
			routingKey: "execution.completed",
		}),
		queue.setup("processor.events", "realtime.run.paused", {
			type: "direct",
			routingKey: "run.paused",
		}),
		queue.setup("processor.events", "realtime.run.resumed", {
			type: "direct",
			routingKey: "run.resumed",
		}),
		queue.setup("processor.events", "realtime.run.finalized", {
			type: "direct",
			routingKey: "run.finalized",
		}),

		queue.setup("processor.events", "realtime.execution.requested", {
			type: "direct",
			routingKey: "execution.sum-requested",
		}),
		queue.setup("processor.events", "realtime.execution.requested", {
			type: "direct",
			routingKey: "execution.subtraction-requested",
		}),
		queue.setup("processor.events", "realtime.execution.requested", {
			type: "direct",
			routingKey: "execution.multiplication-requested",
		}),
		queue.setup("processor.events", "realtime.execution.requested", {
			type: "direct",
			routingKey: "execution.division-requested",
		}),
		queue.setup("processor.events", "realtime.execution.requested", {
			type: "direct",
			routingKey: "execution.unknown-requested",
		}),

		queue.setup("processor.events", "realtime.step.finished", {
			type: "direct",
			routingKey: "step.finished",
		}),
	]);

	const registry = new ClientRegistry();

	await Promise.all([
		executionStartedConsumer(queue, registry),
		executionFailedConsumer(queue, registry),
		executionCompletedConsumer(queue, registry),
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
