import { RunCreatedConsumer } from "./run-created-consumer";

export class QueueConsumers {
    static initialize() {
		new RunCreatedConsumer()
	}
}
