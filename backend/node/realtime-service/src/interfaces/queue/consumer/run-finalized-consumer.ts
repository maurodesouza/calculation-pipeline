import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type RunFinalizedPayload = {
	eventId: string;
	runId: string;
};

export async function runFinalizedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
) {
	await queue.consume(
		"realtime.run.finalized",
		async (message: RunFinalizedPayload) => {
			registry.emit(message.eventId, "run.finalized", { runId: message.runId });
		},
	);
}
