import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type Payload = {
	eventId: string;
	runId: string;
	result: number;
};

export async function executionCompletedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>(
		"realtime.execution.completed",
		async (message) => {
			registry.emit(message.eventId, "run.completed", {
				runId: message.runId,
				result: message.result,
			});
		},
	);
}
