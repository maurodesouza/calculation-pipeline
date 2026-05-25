import { Mediator } from "../infra/mediator/mediator"
import { ExecuteStepEvent } from "./events/execute-step"
import { RunCompletedEvent } from "./events/run-completed"
import { RunStartedEvent } from "./events/run-started"
import { RunAlreadyExistsError, RunNotFoundError, StepNotFoundError, StepExecutionError, InvalidPayloadError } from "./errors"
import { RunFailedEvent } from "./events/run-failed"

export type Step = {
	id: string
	operation: string
	by: number
	nextStepId?: string
}

type Result = {
	error?: string
	result: number
}

type Run = {
	currentStep: string
	results: Map<string, Result>
	steps: Map<string, Step>
	payload: number
}

export class Processor extends Mediator {
	runs: Map<string, Run> = new Map()

	constructor() {
		super()
	}

	private handleFailure(runId: string, error: Error): [false, Error] {
		this.notifyAll(new RunFailedEvent({
			runId,
			error: error.message
		}))

		this.runs.delete(runId)

		return [false, error]
	}

	initialize(runId: string, payload: number, steps: Step[]): [true, undefined] | [false, Error] {
		if (this.runs.has(runId)) {
			return this.handleFailure(runId, new RunAlreadyExistsError())
		}

		if (typeof payload !== 'number') {
			return this.handleFailure(runId, new InvalidPayloadError())
		}

		this.runs.set(runId, {
			currentStep: steps[0]!.id,
			payload,
			results: new Map(),
			steps: new Map(steps.map((step) => [step.id, step])),
		})

		this.notifyAll(new RunStartedEvent(runId))

		void this.schedule(runId, payload)

		return [true, undefined]
	}

	schedule(runId: string, payload: number): [true, undefined] | [false, Error] {
		if (typeof payload !== 'number') {
			return this.handleFailure(runId, new InvalidPayloadError())
		}

		const run = this.runs.get(runId)

		if (!run) {
			return this.handleFailure(runId, new RunNotFoundError())
		}

		const currentStep = run.steps.get(run.currentStep)

		if (!currentStep) {
			return this.handleFailure(runId, new StepNotFoundError())
		}

		this.notifyAll(new ExecuteStepEvent({
			runId,
			value: payload,
			stepId: currentStep.id,
			operation: currentStep.operation,
			by: currentStep.by
		}))

		return [true, undefined]
	}

	executed(runId: string, result: Result): [true, undefined] | [false, Error] {
		const run = this.runs.get(runId)

		if (!run) {
			return this.handleFailure(runId, new RunNotFoundError())
		}

		if (result.error) {
			return this.handleFailure(runId, new StepExecutionError(result.error))
		}

		run.results.set(run.currentStep, result)
		const step = run.steps.get(run.currentStep)

		if (!step) {
			return this.handleFailure(runId, new StepNotFoundError())
		}

		if (!step.nextStepId) {
			this.notifyAll(new RunCompletedEvent({
				runId,
				result: result.result
			}))

			this.runs.delete(runId)

			return [true, undefined]
		}

		run.currentStep = step.nextStepId
		this.runs.set(runId, run)

		void this.schedule(runId, result.result)

		return [true, undefined]
	}
}
