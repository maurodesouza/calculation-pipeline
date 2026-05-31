import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq/rabbitmq-adapter";

type Payload = {
	eventId: string;
	runId: string;
};

export async function runStartedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>("realtime.run.started", async (message) => {
		registry.emit(message.eventId, "run.started", { runId: message.runId });
	});
}
