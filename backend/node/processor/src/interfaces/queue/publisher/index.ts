import { ExecutionStartedPublisher } from "./execution-started-publisher";
import { ExecutionFailedPublisher } from "./execution-failed-publisher";
import { ExecutionCompletedPublisher } from "./execution-completed-publisher";
import { ExecutionRequestedPublisher } from "./execution-requested-publisher";

export class QueuePublishers {
    static initialize() {
		new ExecutionStartedPublisher()
		new ExecutionFailedPublisher()
		new ExecutionCompletedPublisher()
		new ExecutionRequestedPublisher()
	}
}
