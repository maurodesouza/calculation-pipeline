import { QueueConsumers } from "./consumer";

export class QueueInterface {
	static initialize() {
		QueueConsumers.initialize()
	}
}
