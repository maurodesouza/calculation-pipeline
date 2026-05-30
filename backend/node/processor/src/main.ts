import { Processor } from "./domain/processor";
import { Container } from "./infra/DI/container";
import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { Queue } from "./interfaces/queue";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();

	const processor = new Processor();

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

		// Randomize

		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.started",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.failed",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.completed",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.paused",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.resumed",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.finalized",
		}),
		//#endregion

		//#region PUBLISH | STEP EXECUTION QUEUES

		queue.setup("processor.events", "sum.execution.requested", {
			type: "direct",
			routingKey: "execution.sum-requested",
		}),
		queue.setup("processor.events", "subtract.execution.requested", {
			type: "direct",
			routingKey: "execution.subtraction-requested",
		}),
		queue.setup("processor.events", "multiply.execution.requested", {
			type: "direct",
			routingKey: "execution.multiplication-requested",
		}),
		queue.setup("processor.events", "divide.execution.requested", {
			type: "direct",
			routingKey: "execution.division-requested",
		}),
		queue.setup("processor.events", "api.unknown-execution.requested", {
			type: "direct",
			routingKey: "execution.unknown-requested",
		}),
		queue.setup("processor.events", "realtime.step.finished", {
			type: "direct",
			routingKey: "step.finished",
		}),

		// Randomize

		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.sum-requested",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.subtraction-requested",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.multiplication-requested",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.division-requested",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.unknown-requested",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "step.finished",
		}),

		//#endregion

		//#region CONSUMER | STEP EXECUTION QUEUES

		queue.setup("multiply.events", "processor.step.finished", {
			type: "direct",
			routingKey: "step.finished",
		}),
		queue.setup("sum.events", "processor.step.finished", {
			type: "direct",
			routingKey: "step.finished",
		}),
		queue.setup("divide.events", "processor.step.finished", {
			type: "direct",
			routingKey: "step.finished",
		}),
		queue.setup("subtract.events", "processor.step.finished", {
			type: "direct",
			routingKey: "step.finished",
		}),
		//#endregion
	]);

	const instance = Container.getInstance();

	instance.register("processor", processor);
	instance.register("queue", queue);

	Queue.initialize();

	console.log("🚀 processor service is running...");
}

main();
