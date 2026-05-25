import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";
import { Processor } from "./domain/processor";
import { Container } from "./infra/DI/container";
import { Queue } from "./interfaces/queue";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect()

	const processor = new Processor()

	await Promise.all([
		queue.setup("api.events", "processor.run.created", { type: "direct", routingKey: "run.created" }),

		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.started" }),
		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.failed" }),
		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.completed" }),

		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.sum-requested" }),
		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.subtraction-requested" }),
		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.multiplication-requested" }),
		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.division-requested" }),
		queue.setup("processor.randomize", "randomizer", { type: "direct", routingKey: "execution.unknown-requested" }),

		queue.setup("processor.events", "api.execution.started", { type: "direct", routingKey: "execution.started" }),
		queue.setup("processor.events", "api.execution.failed", { type: "direct", routingKey: "execution.failed" }),
		queue.setup("processor.events", "api.execution.completed", { type: "direct", routingKey: "execution.completed" }),

		queue.setup("processor.events", "sum.execution.requested", { type: "direct", routingKey: "execution.sum-requested" }),
		queue.setup("processor.events", "subtract.execution.requested", { type: "direct", routingKey: "execution.subtraction-requested" }),
		queue.setup("processor.events", "multiply.execution.requested", { type: "direct", routingKey: "execution.multiplication-requested" }),
		queue.setup("processor.events", "divide.execution.requested", { type: "direct", routingKey: "execution.division-requested" }),
		queue.setup("processor.events", "api.unknown-execution.requested", { type: "direct", routingKey: "execution.unknown-requested" }),

		queue.setup("multiply.events", "processor.execution.finished", { type: "direct", routingKey: "execution.finished" }),
		queue.setup("sum.events", "processor.execution.finished", { type: "direct", routingKey: "execution.finished" }),
		queue.setup("divide.events", "processor.execution.finished", { type: "direct", routingKey: "execution.finished" }),
		queue.setup("subtract.events", "processor.execution.finished", { type: "direct", routingKey: "execution.finished" }),
	])

	const instance = Container.getInstance()

	instance.register("processor", processor)
	instance.register("queue", queue)

	Queue.initialize()

	console.log("🚀 processor service is running...")
}

main()
