import { RabbitMQAdapter, type RabbitQMTopology } from "./queue";

const topology: RabbitQMTopology[] = [
	{
		exchange: { name: "node.processor.events", type: "topic" },
		queues: [
			{
				name: "node.subtract.execution.requested",
				bindings: ["execution.subtraction-requested"],
			},
		],
	},
	{
		exchange: { name: "node.subtract.randomize", type: "topic" },
		queues: [{ name: "node.randomize", bindings: ["#"] }],
	},
	{
		exchange: { name: "node.subtract.events", type: "topic" },
		queues: [
			{ name: "node.processor.step.finished", bindings: ["step.finished"] },
		],
	},
];

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

	await queue.setup(topology);

	queue.consume<SubtractPayload>(
		"node.subtract.execution.requested",
		async (message) => {
			const { runId, value, by, stepId } = message;

			const operationResult = await executeSubtract(value, by);

			if (operationResult.error) {
				await queue.publish("step.finished", {
					runId,
					stepId,
					error: operationResult.error,
				});
			} else {
				await queue.publish("step.finished", {
					runId,
					stepId,
					result: operationResult.result,
				});
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
