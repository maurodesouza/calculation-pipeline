import type { ClientRegistry } from "../../../domain/run-registry";
import type { RabbitMQAdapter } from "../../../infra/queue/rabbitmq-adapter";

type RunResumedPayload = {
	runId: string;
};

export async function runResumedConsumer(
	queue: RabbitMQAdapter,
	registry: ClientRegistry,
) {
	await queue.consume(
		"realtime.run.resumed",
		async (message: RunResumedPayload) => {
			registry.emit("run.resumed", message);
		},
	);
}
