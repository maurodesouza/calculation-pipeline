import { ExecutionFinishedConsumer } from "./execution-finished-consumer";
import { RunCreatedConsumer } from "./run-created-consumer";
import { RunFinalizeRequestedConsumer } from "./run-finalize-requested-consumer";
import { RunPauseRequestedConsumer } from "./run-pause-requested-consumer";
import { RunResumeRequestedConsumer } from "./run-resume-requested-consumer";

export const QueueConsumers = {
	initialize() {
		new RunCreatedConsumer();
		new ExecutionFinishedConsumer();
		new RunPauseRequestedConsumer();
		new RunResumeRequestedConsumer();
		new RunFinalizeRequestedConsumer();
	},
};
