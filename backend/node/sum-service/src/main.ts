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
		queue.setup("processor.events", "sum.execution.requested", { type: "direct", routingKey: "execution.sum-requested" }),
		queue.setup("sum.randomize", "randomizer", { type: "direct", routingKey: "execution.finished" }),
		queue.setup("sum.events", "processor.execution.finished", { type: "direct", routingKey: "execution.finished" })
	]);

	queue.consume("sum.execution.requested", async (message: SumPayload) => {
		const { runId, value, by } = message;

		const result = value + by;

		await queue.publish("sum.randomize", { runId, result }, { routingKey: "execution.finished" });
	});

	console.log("🚀 sum service is running...");
}

main()
