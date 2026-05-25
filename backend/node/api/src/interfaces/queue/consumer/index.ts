import { ExecutionStartedConsumer } from "./execution-started-consumer";
import { ExecutionFailedConsumer } from "./execution-failed-consumer";
import { ExecutionCompletedConsumer } from "./execution-completed-consumer";

export class QueueConsumers {
    static initialize() {
		new ExecutionStartedConsumer()
		new ExecutionFailedConsumer()
		new ExecutionCompletedConsumer()
	}
}
