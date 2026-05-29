import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type Payload = {
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
			registry.emit("run.completed", {
				runId: message.runId,
				result: message.result,
			});
		},
	);
}
