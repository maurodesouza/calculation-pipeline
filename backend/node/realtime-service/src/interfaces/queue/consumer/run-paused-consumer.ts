import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type RunPausedPayload = {
	eventId: string;
	runId: string;
};

export async function runPausedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
) {
	await queue.consume(
		"realtime.run.paused",
		async (message: RunPausedPayload) => {
			registry.emit(message.eventId, "run.paused", { runId: message.runId });
		},
	);
}
