import { ExecutionFinishedConsumer } from "./execution-finished-consumer";
import { RunCreatedConsumer } from "./run-created-consumer";

export const QueueConsumers = {
	initialize() {
		new RunCreatedConsumer();
		new ExecutionFinishedConsumer();
	},
};
