import { ClientRegistry } from "./domain/run-registry";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
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

	await Promise.all([
		//#region CONSUMER | RUN ACTIONS QUEUES

		queue.setup("processor.events", "realtime.run.started", {
			type: "direct",
			routingKey: "run.started",
		}),
		queue.setup("processor.events", "realtime.run.failed", {
			type: "direct",
			routingKey: "run.failed",
		}),
		queue.setup("processor.events", "realtime.run.completed", {
			type: "direct",
			routingKey: "run.completed",
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
		//#endregion

		//#region CONSUMER | STEP EXECUTION QUEUES

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
		//#endregion
	]);

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
