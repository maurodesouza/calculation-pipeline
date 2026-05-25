import { QueueConsumers } from "./consumer";
import { QueuePublishers } from "./publisher";

export const Queue = {
	initialize() {
		QueueConsumers.initialize();
		QueuePublishers.initialize();
	},
};
