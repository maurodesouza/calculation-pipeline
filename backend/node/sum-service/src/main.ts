import { RabbitMQAdapter } from "./queue";

type SumPayload = {
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
		queue.setup("processor.events", "sum.execution.requested", {
			type: "direct",
			routingKey: "execution.sum-requested",
		}),
		queue.setup("sum.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.finished",
		}),
		queue.setup("sum.events", "processor.execution.finished", {
			type: "direct",
			routingKey: "execution.finished",
		}),
	]);

	queue.consume("sum.execution.requested", async (message: SumPayload) => {
		const { runId, value, by, stepId } = message;

		const operationResult = await executeSum(value, by);

		if (operationResult.error) {
			await queue.publish(
				"sum.events",
				{ runId, stepId, error: operationResult.error },
				{ routingKey: "execution.finished" },
			);
		} else {
			await queue.publish(
				"sum.randomize",
				{ runId, stepId, result: operationResult.result },
				{ routingKey: "execution.finished" },
			);
		}
	});

	async function executeSum(
		value: number,
		by: number,
	): Promise<{ result?: number; error?: string }> {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (Math.random() < 0.1) {
			return { error: `[sum-service]: random error occurred` };
		}

		return { result: value + by };
	}

	console.log("🚀 sum service is running...");
}

main();
