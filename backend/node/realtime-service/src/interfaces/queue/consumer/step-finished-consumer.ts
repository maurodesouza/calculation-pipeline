import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq/rabbitmq-adapter";

type StepFinishedPayload = {
	eventId: string;
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
		"realtime.step.finished",
		async (message) => {
			registry.emit(message.eventId, "step.finished", {
				runId: message.runId,
				stepId: message.stepId,
				result: message.result,
				error: message.error,
			});
		},
	);
}
