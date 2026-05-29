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
		queue.setup("api.randomize", "randomizer", {
			type: "direct",
			routingKey: "run.finalize-requested",
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
		queue.setup("processor.randomize", "realtime.run.finalized", {
			type: "direct",
			routingKey: "run.finalized",
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

	queue.consume(
		"randomizer",
		async (message: Record<string, unknown>, info) => {
			const exchange = `${info.fields.exchange.split(".")[0]}.events`;
			const routingKey = info.fields.routingKey;

			await applyChaos(queue, exchange, routingKey, message);
		},
	);

	async function applyChaos(
		queue: RabbitMQAdapter,
		exchange: string,
		routingKey: string,
		message: Record<string, unknown>,
	) {
		const copies = decideDuplication();
		const interMessageDelay = decideInterMessageDelay();
		const preExecutionDelay = decidePreExecutionDelay();

		await new Promise((resolve) => setTimeout(resolve, preExecutionDelay));

		for (let i = 0; i < copies; i++) {
			await queue.publish(exchange, message, { routingKey });
			await new Promise((resolve) => setTimeout(resolve, interMessageDelay));
		}
	}

	function decideDuplication(): number {
		// 70% chance of 1 copy, 20% of 2, 10% of 3
		const roll = Math.random();
		if (roll < 0.7) return 1;
		if (roll < 0.9) return 2;
		return 3;
	}

	function decideInterMessageDelay(): number {
		// 60% chance of no delay, 40% chance of 500-5000ms
		if (Math.random() < 0.6) return 0;
		return Math.floor(Math.random() * 4500) + 500;
	}

	function decidePreExecutionDelay(): number {
		// 50% chance of no delay, 50% chance of 500-3000ms
		if (Math.random() < 0.5) return 0;
		return Math.floor(Math.random() * 2500) + 500;
	}

	console.log("🚀 randomizer is running");
}

main();
