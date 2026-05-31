import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq/rabbitmq-adapter";

type RunResumedPayload = {
	eventId: string;
	runId: string;
};

export async function runResumedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
) {
	await queue.consume(
		"realtime.run.resumed",
		async (message: RunResumedPayload) => {
			registry.emit(message.eventId, "run.resumed", { runId: message.runId });
		},
	);
}
