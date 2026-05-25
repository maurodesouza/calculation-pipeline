import { ExecutionCompletedConsumer } from "./execution-completed-consumer";
import { ExecutionFailedConsumer } from "./execution-failed-consumer";
import { ExecutionStartedConsumer } from "./execution-started-consumer";

export const QueueConsumers = {
	initialize() {
		new ExecutionStartedConsumer();
		new ExecutionFailedConsumer();
		new ExecutionCompletedConsumer();
	},
};
