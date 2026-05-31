import { ExecutionRequestedPublisher } from "./execution-requested-publisher";
import { RunCompletedPublisher } from "./run-completed-publisher";
import { RunFailedPublisher } from "./run-failed-publisher";
import { RunFinalizedPublisher } from "./run-finalized-publisher";
import { RunPausedPublisher } from "./run-paused-publisher";
import { RunResumedPublisher } from "./run-resumed-publisher";
import { RunStartedPublisher } from "./run-started-publisher";
import { StepFinishedPublisher } from "./step-finished-publisher";

export const QueuePublishers = {
	initialize() {
		new RunStartedPublisher();
		new RunFailedPublisher();
		new RunCompletedPublisher();
		new ExecutionRequestedPublisher();
		new StepFinishedPublisher();

		new RunPausedPublisher();
		new RunResumedPublisher();
		new RunFinalizedPublisher();
	},
};
