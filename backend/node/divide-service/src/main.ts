import { RabbitMQAdapter, type RabbitQMTopology } from "./queue";

const topology: RabbitQMTopology[] = [
	{
		exchange: { name: "processor.events", type: "topic" },
		queues: [
			{
				name: "divide.execution.requested",
				bindings: ["execution.division-requested"],
			},
		],
	},
	{
		exchange: { name: "divide.randomize", type: "topic" },
		queues: [{ name: "randomizer", bindings: ["#"] }],
	},
	{
		exchange: { name: "divide.events", type: "topic" },
		queues: [{ name: "processor.step.finished", bindings: ["step.finished"] }],
	},
];

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

	await queue.setup(topology);

	queue.consume<DividePayload>(
		"divide.execution.requested",
		async (message) => {
			const { runId, value, by, stepId } = message;

			const operationResult = await executeDivide(value, by);

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
