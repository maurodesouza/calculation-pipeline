import { RabbitMQAdapter, type RabbitQMTopology } from "./queue";

const topology: RabbitQMTopology[] = [
	{
		exchange: { name: "node.processor.events", type: "topic" },
		queues: [
			{
				name: "node.sum.execution.requested",
				bindings: ["execution.sum-requested"],
			},
		],
	},
	{
		exchange: { name: "node.sum.randomize", type: "topic" },
		queues: [{ name: "node.randomize", bindings: ["#"] }],
	},
	{
		exchange: { name: "node.sum.events", type: "topic" },
		queues: [
			{ name: "node.processor.step.finished", bindings: ["step.finished"] },
		],
	},
];

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

	await queue.setup(topology);

	queue.consume<SumPayload>("node.sum.execution.requested", async (message) => {
		const { runId, value, by, stepId } = message;

		const operationResult = await executeSum(value, by);

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
