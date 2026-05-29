import { ExecutionFinishedConsumer } from "./execution-finished-consumer";
import { RunCreatedConsumer } from "./run-created-consumer";
import { RunFinalizeConsumer } from "./run-finalize-consumer";
import { RunPauseConsumer } from "./run-pause-consumer";
import { RunResumeConsumer } from "./run-resume-consumer";

export const QueueConsumers = {
	initialize() {
		new RunCreatedConsumer();
		new ExecutionFinishedConsumer();
		new RunPauseConsumer();
		new RunResumeConsumer();
		new RunFinalizeConsumer();
	},
};
