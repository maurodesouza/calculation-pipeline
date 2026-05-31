import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq/rabbitmq-adapter";

type Payload = {
	eventId: string;
	runId: string;
	error: string;
};

export async function runFailedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>("realtime.run.failed", async (message) => {
		registry.emit(message.eventId, "run.failed", {
			runId: message.runId,
			error: message.error,
		});
	});
}
