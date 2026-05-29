import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type Payload = {
	runId: string;
	result?: number;
	error?: string;
};

export async function executionFinishedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>(
		"realtime.execution.finished",
		async (message) => {
			registry.emit("step.finished", {
				runId: message.runId,
				result: message.result,
				error: message.error,
			});
		},
	);
}
