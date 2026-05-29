import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();

	await Promise.all([
		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.created",
		}),
		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.pause",
		}),
		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.resume",
		}),

		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.started",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.failed",
		}),
		queue.setup("processor.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.completed",
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
	]);

	queue.consume("randomizer", async (message: any, info) => {
		const exchange = `${info.fields.exchange.split(".")[0]}.events`;
		const routingKey = info.fields.routingKey;

		await new Promise((resolve) => setTimeout(resolve, 5000));

		await queue.publish(exchange, message, { routingKey });
	});

	console.log("🚀 randomizer is running");
}

main();
