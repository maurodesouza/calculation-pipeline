import { RunCompletedConsumer } from "./run-completed-consumer";
import { RunFailedConsumer } from "./run-failed-consumer";
import { RunStartedConsumer } from "./run-started-consumer";

export const QueueConsumers = {
	initialize() {
		new RunStartedConsumer();
		new RunFailedConsumer();
		new RunCompletedConsumer();
	},
};
