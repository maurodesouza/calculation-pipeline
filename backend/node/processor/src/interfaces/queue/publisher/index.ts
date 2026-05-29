import { ExecutionCompletedPublisher } from "./execution-completed-publisher";
import { ExecutionFailedPublisher } from "./execution-failed-publisher";
import { ExecutionRequestedPublisher } from "./execution-requested-publisher";
import { ExecutionStartedPublisher } from "./execution-started-publisher";
import { RunPausedPublisher } from "./run-paused-publisher";
import { RunResumedPublisher } from "./run-resumed-publisher";

export const QueuePublishers = {
	initialize() {
		new ExecutionStartedPublisher();
		new ExecutionFailedPublisher();
		new ExecutionCompletedPublisher();
		new ExecutionRequestedPublisher();

		new RunPausedPublisher();
		new RunResumedPublisher();
	},
};
