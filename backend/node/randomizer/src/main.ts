import { RabbitMQAdapter } from "./infra/queue/rabbitmq/rabbitmq-adapter";
import { rabbitQMTopology } from "./infra/queue/rabbitmq/rabbitmq-topology";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();

	await queue.setup(rabbitQMTopology);

	queue.consume<Record<string, unknown>>(
		"randomize",
		async (message, metadata, headers) => {
			const exchange = metadata.event.split(".")[0] + ".events";
			const routingKey = metadata.event;

			await applyChaos(queue, exchange, routingKey, message, headers);
		},
	);

	async function applyChaos(
		queue: RabbitMQAdapter,
		exchange: string,
		routingKey: string,
		message: Record<string, unknown>,
		headers: Record<string, unknown>,
	) {
		const copies = decideDuplication();
		const interMessageDelay = decideInterMessageDelay();
		const preExecutionDelay = decidePreExecutionDelay();

		await new Promise((resolve) => setTimeout(resolve, preExecutionDelay));

		for (let i = 0; i < copies; i++) {
			await queue.publish(`${exchange}/${routingKey}`, message, {
				headers: headers as Record<string, string | number | boolean>,
			});
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
