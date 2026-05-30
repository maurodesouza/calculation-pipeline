import { Mediator } from "../infra/mediator/mediator";
import {
	CannotResumeRunError,
	InvalidPayloadError,
	RunAlreadyExistsError,
	RunFinalizedError,
	RunNotFoundError,
	StepExecutionError,
	StepNotFoundError,
} from "./errors";
import { ExecuteStepEvent } from "./events/execute-step";
import { ExecutionFinishedEvent } from "./events/execution-finished";
import { RunCompletedEvent } from "./events/run-completed";
import { RunFailedEvent } from "./events/run-failed";
import { RunFinalizedEvent } from "./events/run-finalized";
import { RunPausedEvent } from "./events/run-paused";
import { RunResumedEvent } from "./events/run-resumed";
import { RunStartedEvent } from "./events/run-started";

export type Step = {
	id: string;
	operation: string;
	by: number;
	nextStepId?: string;
};

type Result = {
	error?: string;
	result: number;
	stepId?: string;
};

type Run = {
	currentStep: string;
	results: Map<string, Result>;
	steps: Map<string, Step>;
	lastStep?: string;
	payload: number;
	paused: boolean;
	executingStep?: string;
	finalizeRequested?: boolean;
};

export class Processor extends Mediator {
	runs: Map<string, Run> = new Map();

	private handleFailure(runId: string, error: Error): [false, Error] {
		this.notifyAll(
			new RunFailedEvent({
				runId,
				error: error.message,
			}),
		);

		this.runs.delete(runId);

		return [false, error];
	}

	initialize(
		runId: string,
		payload: number,
		steps: Step[],
	): [true, undefined] | [false, Error] {
		if (this.runs.has(runId)) return [false, new RunAlreadyExistsError()];

		if (typeof payload !== "number")
			return this.handleFailure(runId, new InvalidPayloadError());

		const firstStep = steps[0];
		if (!firstStep) return [false, new StepNotFoundError()];

		this.runs.set(runId, {
			currentStep: firstStep.id,
			payload,
			results: new Map(),
			steps: new Map(steps.map((step) => [step.id, step])),
			paused: false,
		});

		this.notifyAll(new RunStartedEvent({ runId }));

		const [, error] = this.schedule(runId, payload);
		if (error) return [false, error];

		return [true, undefined];
	}

	schedule(runId: string, payload: number): [true, undefined] | [false, Error] {
		const run = this.runs.get(runId);
		if (!run) return [false, new RunNotFoundError()];

		if (typeof payload !== "number") {
			return this.handleFailure(runId, new InvalidPayloadError());
		}

		const currentStep = run.steps.get(run.currentStep);
		if (!currentStep) return this.handleFailure(runId, new StepNotFoundError());

		run.executingStep = currentStep.id;
		this.runs.set(runId, run);

		this.notifyAll(
			new ExecuteStepEvent({
				runId,
				value: payload,
				stepId: currentStep.id,
				operation: currentStep.operation,
				by: currentStep.by,
			}),
		);

		return [true, undefined];
	}

	executed(
		runId: string,
		stepId: string,
		result: Result,
	): [true, undefined] | [false, Error] {
		const run = this.runs.get(runId);
		if (!run) return [false, new RunNotFoundError()];

		if (stepId !== run.executingStep) return [true, undefined];

		this.notifyAll(
			new ExecutionFinishedEvent({
				runId,
				stepId,
				result: result.result,
				error: result.error,
			}),
		);

		if (result.error) {
			return this.handleFailure(runId, new StepExecutionError(result.error));
		}

		run.results.set(run.currentStep, result);
		run.executingStep = undefined;
		this.runs.set(runId, run);

		if (run.finalizeRequested) {
			this.notifyAll(new RunFinalizedEvent({ runId }));
			this.handleFailure(runId, new RunFinalizedError());
			return [true, undefined];
		}

		const step = run.steps.get(run.currentStep);
		if (!step) return this.handleFailure(runId, new StepNotFoundError());

		if (!step.nextStepId) {
			this.notifyAll(
				new RunCompletedEvent({
					runId,
					result: result.result,
				}),
			);

			this.runs.delete(runId);

			return [true, undefined];
		}

		run.lastStep = step.id;
		run.currentStep = step.nextStepId;
		this.runs.set(runId, run);

		if (run.paused) this.notifyAll(new RunPausedEvent({ runId }));
		else void this.schedule(runId, result.result);

		return [true, undefined];
	}

	pause(runId: string): [true, undefined] | [false, Error] {
		const run = this.runs.get(runId);
		if (!run) return [false, new RunNotFoundError()];

		run.paused = true;
		this.runs.set(runId, run);

		return [true, undefined];
	}

	resume(runId: string): [true, undefined] | [false, Error] {
		const run = this.runs.get(runId);
		if (!run) return [false, new RunNotFoundError()];

		if (!run.paused) {
			return [true, undefined];
		}

		run.paused = false;
		this.runs.set(runId, run);

		const stepToResume = run.lastStep ?? run.currentStep;
		const lastResult = run.results.get(stepToResume);
		if (!lastResult) return [false, new CannotResumeRunError()];

		void this.schedule(runId, lastResult.result);
		this.notifyAll(new RunResumedEvent({ runId }));

		return [true, undefined];
	}

	finalize(runId: string): [true, undefined] | [false, Error] {
		const run = this.runs.get(runId);
		if (!run) return [false, new RunNotFoundError()];

		if (run.executingStep) {
			run.finalizeRequested = true;
			this.runs.set(runId, run);
			return [true, undefined];
		}

		this.notifyAll(new RunFinalizedEvent({ runId }));
		this.runs.delete(runId);
		this.handleFailure(runId, new RunFinalizedError());

		return [true, undefined];
	}
}
