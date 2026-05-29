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
			const { runId, value, by, stepId } = message;

			const operationResult = await executeSubtract(value, by);

			if (operationResult.error) {
				await queue.publish(
					"subtract.events",
					{ runId, stepId, error: operationResult.error },
					{ routingKey: "execution.finished" },
				);
			} else {
				await queue.publish(
					"subtract.randomize",
					{ runId, stepId, result: operationResult.result },
					{ routingKey: "execution.finished" },
				);
			}
		},
	);

	async function executeSubtract(
		value: number,
		by: number,
	): Promise<{ result?: number; error?: string }> {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (Math.random() < 0.1) {
			return { error: `[subtract-service]: random error occurred` };
		}

		return { result: value - by };
	}

	console.log("🚀 subtract service is running...");
}

main();
