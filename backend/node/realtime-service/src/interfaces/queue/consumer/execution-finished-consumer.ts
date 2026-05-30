import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type ExecutionFinishedPayload = {
	runId: string;
	stepId: string;
	result?: number;
	error?: string;
};

export async function executionFinishedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<ExecutionFinishedPayload>(
		"realtime.execution.finished",
		async (message) => {
			registry.emit("step.finished", {
				runId: message.runId,
				stepId: message.stepId,
				result: message.result,
				error: message.error,
			});
		},
	);
}
