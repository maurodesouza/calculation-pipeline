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
			const { runId, value, by } = message;

			const result = value / by;

			await queue.publish(
				"divide.randomize",
				{ runId, result },
				{ routingKey: "execution.finished" },
			);
		},
	);

	console.log("🚀 divide service is running...");
}

main();
