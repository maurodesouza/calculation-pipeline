import { Processor, Step } from "../src/domain/processor";
import { CannotResumeRunError, RunAlreadyExistsError, RunNotFoundError, StepNotFoundError, StepExecutionError, InvalidPayloadError } from "../src/domain/errors";
import { FinalizedError } from "../src/domain/errors/run-finalized";

describe("processor", () => {
	let processor: Processor

	beforeEach(() => {
		processor = new Processor()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe("initialize", () => {
		it("should initialize the processing", async () => {
			const notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});

			const scheduleSpy = vitest.spyOn(Processor.prototype, "schedule").mockImplementation(() => [true, undefined])

			const runId = "123"
			const payload = 100

			const input = {
				runId,
				steps: [
					{
						id: "1",
						operation: "multiply",
						by: 10,
						nextStepId: "2",
					},
					{
						id: "2",
						operation: "divide",
						by: 2,
						nextStepId: "3",
					},
					{
						id: "3",
						operation: "subtract",
						by: 25,
						nextStepId: "4",
					},
					{
						id: "4",
						operation: "sum",
						by: 5,
					}
				]
			}

			processor.initialize(runId, payload, input.steps)

			await new Promise(resolve => setTimeout(resolve, 10));

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);

			expect(notifications[0]).toStrictEqual({ runId });

			expect(scheduleSpy).toHaveBeenCalledTimes(1);
			expect(scheduleSpy).toHaveBeenNthCalledWith(1, runId, payload);
		});

		it("should avoid the processing if the run already exists", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});
			const scheduleSpy = vitest.spyOn(Processor.prototype, "schedule").mockImplementation(() => [true, undefined])

			const runId = "123"
			const payload = 100

			const input = {
				runId,
				steps: [
					{
						id: "1",
						operation: "multiply",
						by: 10,
					},
				]
			}

			processor.initialize(runId, payload, input.steps)
			await new Promise(resolve => setTimeout(resolve, 10));

			notifications = []
			notifyAllSpy.mockClear()

			const [, error] = processor.initialize(runId, payload, input.steps)

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(RunAlreadyExistsError)

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].error).toBeDefined();

			expect(scheduleSpy).toHaveBeenCalledTimes(1);
		});

		it("should return error when payload is invalid in initialize", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});

			const runId = "123"
			const payload = "invalid" as any

			const input = {
				runId,
				steps: [
					{
						id: "1",
						operation: "multiply",
						by: 10,
					},
				]
			}

			const [, error] = processor.initialize(runId, payload, input.steps)

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(InvalidPayloadError)

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe(runId);
			expect(notifications[0].error).toBeDefined();
		});
	});

	describe("schedule", () => {
		it("should schedule the processing", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});

			const runId = "123"
			const steps = new Map<string, Step>()

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10
			})

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false,
			})

			const [, error] = processor.schedule(runId, 100)

			expect(error).toBeUndefined()

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0]).toStrictEqual({ runId, value: 100, stepId: "1", operation: "multiply", by: 10 });
		});

		it("should return error when run does not exist", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});

			const [, error] = processor.schedule("non-existent-run-id", 100)

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(RunNotFoundError)

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe("non-existent-run-id");
			expect(notifications[0].error).toBeDefined();
		});

		it("should return error when step does not exist", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});
			const runId = "123"

			processor.runs.set(runId, {
				currentStep: "missing-step",
				results: new Map(),
				steps: new Map(),
				payload: 100,
				paused: false
			})

			const [, error] = processor.schedule(runId, 100)

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(StepNotFoundError)

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe(runId);
			expect(notifications[0].error).toBeDefined();
		});

		it("should return error when payload is invalid in schedule", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});
			const runId = "123"
			const steps = new Map<string, Step>()

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10
			})

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false,
			})

			const [, error] = processor.schedule(runId, "invalid" as any)

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(InvalidPayloadError)

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe(runId);
			expect(notifications[0].error).toBeDefined();
		});
	});

	describe("executed", () => {
		it("should proceed to the next step", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});
			const scheduleSpy = vitest.spyOn(Processor.prototype, "schedule").mockImplementation(() => [true, undefined])


			const runId = "123"
			const steps = new Map<string, Step>()

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
				nextStepId: "2"
			})

			steps.set("2", {
				id: "2",
				operation: "multiply",
				by: 10
			})

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false
			})

			const [, error] = processor.executed(runId, { result: 100, error: undefined })

			expect(error).toBeUndefined()

			expect(notifyAllSpy).toHaveBeenCalledTimes(0);
			expect(notifications).toHaveLength(0);

			expect(processor.runs.get(runId)?.currentStep).toBe("2");

			expect(scheduleSpy).toHaveBeenCalledTimes(1);
			expect(scheduleSpy).toHaveBeenCalledWith(runId, 100);

		});

		it("should emit RunCompletedEvent when processing finishes", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});
			const scheduleSpy = vitest.spyOn(Processor.prototype, "schedule").mockImplementation(() => [true, undefined])

			const runId = "123"
			const steps = new Map<string, Step>()

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10
			})

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false
			})

			const [, error] = processor.executed(runId, { result: 100, error: undefined })

			expect(error).toBeUndefined()

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe(runId);
			expect(notifications[0].result).toBe(100);

			expect(processor.runs.has(runId)).toBe(false);

			expect(scheduleSpy).toHaveBeenCalledTimes(0);
		});

		it("should emit RunFailedEvent and delete run when run not found", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});

			const runId = "non-existent-run"

			const [, error] = processor.executed(runId, { result: 100, error: undefined })

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(RunNotFoundError)

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe(runId);
			expect(notifications[0].error).toBeDefined();
		});

		it("should emit RunFailedEvent and delete run when step not found", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});

			const runId = "123"
			const steps = new Map<string, Step>()

			processor.runs.set(runId, {
				currentStep: "missing-step",
				results: new Map(),
				steps,
				payload: 100,
				paused: false
			})

			const [, error] = processor.executed(runId, { result: 100, error: undefined })

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(StepNotFoundError)

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe(runId);
			expect(notifications[0].error).toBeDefined();

			expect(processor.runs.has(runId)).toBe(false);
		});

		it("should emit RunFailedEvent and delete run when execution fails", async () => {
			let notifications: any[] = []

			const notifyAllSpy = vitest.spyOn(Processor.prototype, "notifyAll").mockImplementation(async (event) => {
				notifications.push(event.getPayload());
			});

			const runId = "123"
			const steps = new Map<string, Step>()

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10
			})

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false
			})

			const [, error] = processor.executed(runId, { result: 0, error: "division by zero" })

			expect(error).toBeDefined()
			expect(error).toBeInstanceOf(StepExecutionError)
			expect(error?.message).toBe("[processor]: step failed: division by zero")

			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications).toHaveLength(1);
			expect(notifications[0].runId).toBe(runId);
			expect(notifications[0].error).toBeDefined();

			expect(processor.runs.has(runId)).toBe(false);
		});
	});

	describe("pause", () => {
		it("should set run as paused", async () => {
			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false,
			});

			const [, error] = processor.pause(runId);

			expect(error).toBeUndefined();
			expect(processor.runs.get(runId)?.paused).toBe(true);
		});

		it("should return error when run does not exist", async () => {
			const [, error] = processor.pause("non-existent-run-id");

			expect(error).toBeDefined();
			expect(error).toBeInstanceOf(RunNotFoundError);
		});
	});

	describe("resume", () => {
		it("should resume a paused run and schedule next step", async () => {
			const notifications: any[] = [];

			const notifyAllSpy = vitest
				.spyOn(Processor.prototype, "notifyAll")
				.mockImplementation(async (event) => {
					notifications.push(event.getPayload());
				});
			const scheduleSpy = vitest
				.spyOn(Processor.prototype, "schedule")
				.mockImplementation(() => [true, undefined]);

			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("2", {
				id: "2",
				operation: "multiply",
				by: 10,
			});

			const results = new Map();
			results.set("2", { result: 100, error: undefined });

			processor.runs.set(runId, {
				currentStep: "2",
				results,
				steps,
				payload: 100,
				paused: true,
			});

			const [, error] = processor.resume(runId);

			expect(error).toBeUndefined();
			expect(processor.runs.get(runId)?.paused).toBe(false);
			expect(scheduleSpy).toHaveBeenCalledTimes(1);
			expect(scheduleSpy).toHaveBeenCalledWith(runId, 100);
			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications[0]).toStrictEqual({ runId });
		});

		it("should return error when run does not exist", async () => {
			const [, error] = processor.resume("non-existent-run-id");

			expect(error).toBeDefined();
			expect(error).toBeInstanceOf(RunNotFoundError);
		});

		it("should return success without scheduling if run is not paused", async () => {
			const scheduleSpy = vitest
				.spyOn(Processor.prototype, "schedule")
				.mockImplementation(() => [true, undefined]);

			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false,
			});

			const [, error] = processor.resume(runId);

			expect(error).toBeUndefined();
			expect(scheduleSpy).toHaveBeenCalledTimes(0);
		});

		it("should return error when no previous result to resume from", async () => {
			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(), // no results for current step
				steps,
				payload: 100,
				paused: true,
			});

			const [, error] = processor.resume(runId);

			expect(error).toBeDefined();
			expect(error).toBeInstanceOf(CannotResumeRunError);
		});
	});

	describe("pause behavior in executed", () => {
		it("should not schedule next step when run is paused", async () => {
			const notifications: any[] = [];

			const notifyAllSpy = vitest
				.spyOn(Processor.prototype, "notifyAll")
				.mockImplementation(async (event) => {
					notifications.push(event.getPayload());
				});
			const scheduleSpy = vitest
				.spyOn(Processor.prototype, "schedule")
				.mockImplementation(() => [true, undefined]);

			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
				nextStepId: "2",
			});

			steps.set("2", {
				id: "2",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: true, // run is paused
			});

			const [, error] = processor.executed(runId, { result: 100, error: undefined });

			expect(error).toBeUndefined();
			expect(processor.runs.get(runId)?.currentStep).toBe("2");
			expect(scheduleSpy).toHaveBeenCalledTimes(0);
			expect(notifyAllSpy).toHaveBeenCalledTimes(1);
			expect(notifications[0]).toStrictEqual({ runId });
		});

		it("should schedule next step when run is not paused", async () => {
			const scheduleSpy = vitest
				.spyOn(Processor.prototype, "schedule")
				.mockImplementation(() => [true, undefined]);

			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
				nextStepId: "2",
			});

			steps.set("2", {
				id: "2",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false, // run is not paused
			});

			const [, error] = processor.executed(runId, { result: 100, error: undefined });

			expect(error).toBeUndefined();
			expect(processor.runs.get(runId)?.currentStep).toBe("2");
			expect(scheduleSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("finalize", () => {
		it("should finalize immediately when run is paused and not executing", async () => {
			const notifications: any[] = [];

			const notifyAllSpy = vitest
				.spyOn(Processor.prototype, "notifyAll")
				.mockImplementation(async (event) => {
					notifications.push(event.getPayload());
				});

			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: true,
				executingStep: undefined,
			});

			const [success, error] = processor.finalize(runId);

			expect(success).toBe(true);
			expect(error).toBeUndefined();
			expect(processor.runs.has(runId)).toBe(false);
			expect(notifyAllSpy).toHaveBeenCalledTimes(2);
			expect(notifications[0]).toStrictEqual({ runId });
			expect(notifications[1]).toStrictEqual({ runId, error: expect.any(String) });
		});

		it("should set finalizeRequested flag when step is executing", async () => {
			const notifyAllSpy = vitest
				.spyOn(Processor.prototype, "notifyAll")
				.mockImplementation(async () => {});

			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false,
				executingStep: "1",
			});

			const [success, error] = processor.finalize(runId);

			expect(success).toBe(true);
			expect(error).toBeUndefined();
			expect(processor.runs.get(runId)?.finalizeRequested).toBe(true);
			expect(notifyAllSpy).not.toHaveBeenCalled();
		});

		it("should finalize when executed is called with finalizeRequested", async () => {
			const notifications: any[] = [];

			const notifyAllSpy = vitest
				.spyOn(Processor.prototype, "notifyAll")
				.mockImplementation(async (event) => {
					notifications.push(event.getPayload());
				});

			const runId = "123";
			const steps = new Map<string, Step>();

			steps.set("1", {
				id: "1",
				operation: "multiply",
				by: 10,
				nextStepId: "2",
			});

			steps.set("2", {
				id: "2",
				operation: "multiply",
				by: 10,
			});

			processor.runs.set(runId, {
				currentStep: "1",
				results: new Map(),
				steps,
				payload: 100,
				paused: false,
				executingStep: "1",
				finalizeRequested: true,
			});

			const [, error] = processor.executed(runId, { result: 100, error: undefined });

			expect(error).toBeUndefined();
			expect(processor.runs.has(runId)).toBe(false);
			expect(notifyAllSpy).toHaveBeenCalledTimes(2);
			expect(notifications[0]).toStrictEqual({ runId });
			expect(notifications[1]).toStrictEqual({ runId, error: expect.any(String) });
		});

		it("should return error when run not found", async () => {
			const [, error] = processor.finalize("non-existent");

			expect(error).toBeDefined();
			expect(error).toBeInstanceOf(RunNotFoundError);
		});
	});
});

