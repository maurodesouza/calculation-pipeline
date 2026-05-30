import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type Payload = {
	eventId: string;
	runId: string;
	result: number;
};

export async function runCompletedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>(
		"realtime.run.completed",
		async (message) => {
			registry.emit(message.eventId, "run.completed", {
				runId: message.runId,
				result: message.result,
			});
		},
	);
}
