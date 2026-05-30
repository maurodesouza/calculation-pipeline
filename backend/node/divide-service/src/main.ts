import { RabbitMQAdapter } from "./queue";

type DividePayload = {
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
		queue.setup("processor.events", "divide.execution.requested", {
			type: "direct",
			routingKey: "execution.division-requested",
		}),
		queue.setup("divide.randomize", "randomizer", {
			type: "direct",
			routingKey: "execution.finished",
		}),
		queue.setup("divide.events", "processor.execution.finished", {
			type: "direct",
			routingKey: "execution.finished",
		}),
	]);

	queue.consume(
		"divide.execution.requested",
		async (message: DividePayload) => {
			const { runId, value, by, stepId } = message;

			const operationResult = await executeDivide(value, by);

			if (operationResult.error) {
				await queue.publish(
					"divide.events",
					{ runId, stepId, error: operationResult.error },
					{ routingKey: "execution.finished" },
				);
			} else {
				await queue.publish(
					"divide.randomize",
					{ runId, stepId, result: operationResult.result },
					{ routingKey: "execution.finished" },
				);
			}
		},
	);

	async function executeDivide(
		value: number,
		by: number,
	): Promise<{ result?: number; error?: string }> {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (Math.random() < 0.9) {
			return { error: `[divide-service]: random error occurred` };
		}

		return { result: value / by };
	}

	console.log("🚀 divide service is running...");
}

main();
