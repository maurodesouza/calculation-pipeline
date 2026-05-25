import { RabbitMQAdapter } from "./queue";

type SubtractPayload = {
	runId: string;
	value: number;
	stepId: string;
	operation: string;
	by: number;
};

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();

	await Promise.all([
		queue.setup("processor.events", "subtract.execution.requested", {
			type: "direct",
			routingKey: "execution.subtraction-requested",
		}),
		queue.setup("subtract.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.finished",
		}),
		queue.setup("subtract.events", "processor.execution.finished", {
			type: "direct",
			routingKey: "execution.finished",
		}),
	]);

	queue.consume(
		"subtract.execution.requested",
		async (message: SubtractPayload) => {
			const { runId, value, by } = message;

			const result = value - by;

			await queue.publish(
				"subtract.randomize",
				{ runId, result },
				{ routingKey: "execution.finished" },
			);
		},
	);

	console.log("🚀 subtract service is running...");
}

main();
