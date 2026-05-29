import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type Payload = {
	runId: string;
};

export async function executionStartedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>(
		"realtime.execution.started",
		async (message) => {
			registry.emit("run.started", { runId: message.runId });
		},
	);
}
