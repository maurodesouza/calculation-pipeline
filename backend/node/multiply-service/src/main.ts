import { RabbitMQAdapter } from "./queue";

type MultiplyPayload = {
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
		queue.setup("processor.events", "multiply.execution.requested", {
			type: "direct",
			routingKey: "execution.multiplication-requested",
		}),
		queue.setup("multiply.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.finished",
		}),
		queue.setup("multiply.events", "processor.execution.finished", {
			type: "direct",
			routingKey: "execution.finished",
		}),
	]);

	queue.consume(
		"multiply.execution.requested",
		async (message: MultiplyPayload) => {
			const { runId, value, by } = message;

			const operationResult = await executeMultiply(value, by);

			if (operationResult.error) {
				await queue.publish(
					"multiply.events",
					{ runId, error: operationResult.error },
					{ routingKey: "execution.finished" },
				);
			} else {
				await queue.publish(
					"multiply.randomize",
					{ runId, result: operationResult.result },
					{ routingKey: "execution.finished" },
				);
			}
		},
	);

	async function executeMultiply(
		value: number,
		by: number,
	): Promise<{ result?: number; error?: string }> {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (Math.random() < 0.1) {
			return { error: `[multiply-service]: random error occurred` };
		}

		return { result: value * by };
	}

	console.log("🚀 multiply service is running...");
}

main();
