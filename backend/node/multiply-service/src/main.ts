import { RabbitMQAdapter, type RabbitQMTopology } from "./queue";

const topology: RabbitQMTopology[] = [
	{
		exchange: { name: "processor.events", type: "topic" },
		queues: [
			{
				name: "multiply.execution.requested",
				bindings: ["execution.multiplication-requested"],
			},
		],
	},
	{
		exchange: { name: "multiply.randomize", type: "topic" },
		queues: [{ name: "randomizer", bindings: ["#"] }],
	},
	{
		exchange: { name: "multiply.events", type: "topic" },
		queues: [{ name: "processor.step.finished", bindings: ["step.finished"] }],
	},
];

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

	await queue.setup(topology);

	queue.consume<MultiplyPayload>(
		"multiply.execution.requested",
		async (message) => {
			const { runId, value, by, stepId } = message;

			const operationResult = await executeMultiply(value, by);

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
