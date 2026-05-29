import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type StepFinishedPayload = {
	runId: string;
	stepId: string;
	result?: number;
	error?: string;
};

export async function stepFinishedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
): Promise<void> {
	await queue.consume<StepFinishedPayload>(
		"processor.events",
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
