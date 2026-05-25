import { ExecutionCompletedPublisher } from "./execution-completed-publisher";
import { ExecutionFailedPublisher } from "./execution-failed-publisher";
import { ExecutionRequestedPublisher } from "./execution-requested-publisher";
import { ExecutionStartedPublisher } from "./execution-started-publisher";

export const QueuePublishers = {
	initialize() {
		new ExecutionStartedPublisher();
		new ExecutionFailedPublisher();
		new ExecutionCompletedPublisher();
		new ExecutionRequestedPublisher();
	},
};
