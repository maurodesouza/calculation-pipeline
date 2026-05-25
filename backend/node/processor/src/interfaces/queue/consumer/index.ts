import { RunCreatedConsumer } from "./run-created-consumer";
import { ExecutionFinishedConsumer } from "./execution-finished-consumer";

export class QueueConsumers {
    static initialize() {
		new RunCreatedConsumer()
		new ExecutionFinishedConsumer()
	}
}
