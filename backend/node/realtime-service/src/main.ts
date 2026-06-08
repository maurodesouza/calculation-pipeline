import { ClientRegistry } from "./client-registry";
import { RabbitMQAdapter, type RabbitQMTopology } from "./queue";
import { createServer } from "./server";

const topology: RabbitQMTopology[] = [
	{
		exchange: { name: "node.api.events", type: "topic" },
		queues: [{ name: "node.realtime", bindings: ["#"] }],
	},
	{
		exchange: { name: "node.processor.events", type: "topic" },
		queues: [{ name: "node.realtime", bindings: ["#"] }],
	},
];

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect();
	await queue.setup(topology);

	const registry = new ClientRegistry();
	const server = createServer(registry);

	queue.consume<Record<string, unknown>>(
		"node.realtime",
		async (message, metadata, headers) => {
			if (headers.realtime !== true) return;

			const eventId = message.eventId as string;
			const eventName = metadata.event;

			registry.emit(eventId, eventName, message);
		},
	);

	server.listen(3500, () => {
		console.log("🚀 realtime service is running on port 3500");
	});
}

main();
