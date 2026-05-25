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
		queue.setup("processor.events", "multiply.execution.requested", { type: "direct", routingKey: "execution.multiplication-requested" }),
		queue.setup("multiply.randomize", "randomizer", { type: "direct", routingKey: "execution.finished" }),
		queue.setup("multiply.events", "processor.execution.finished", { type: "direct", routingKey: "execution.finished" })
	]);

	queue.consume("multiply.execution.requested", async (message: MultiplyPayload) => {
		const { runId, value, by } = message;

		const result = value * by;

		await queue.publish("multiply.randomize", { runId, result }, { routingKey: "execution.finished" });
	});

	console.log("🚀 multiply service is running...");
}

main()
