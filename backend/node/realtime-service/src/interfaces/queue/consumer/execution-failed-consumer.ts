import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type Payload = {
	runId: string;
	error: string;
};

export async function executionFailedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>("realtime.execution.failed", async (message) => {
		registry.emit("run.failed", {
			runId: message.runId,
			error: message.error,
		});
	});
}
