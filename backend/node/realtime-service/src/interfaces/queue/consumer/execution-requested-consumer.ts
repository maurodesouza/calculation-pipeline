import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type Payload = {
	runId: string;
	stepId: string;
	operation: string;
	value: number;
	by: number;
};

export async function executionRequestedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<Payload>(
		"realtime.execution.requested",
		async (message) => {
			registry.emit("step.requested", {
				runId: message.runId,
				stepId: message.stepId,
				operation: message.operation,
				value: message.value,
				by: message.by,
			});
		},
	);
}
