import { Processor, Step } from "../src/domain/processor";
import { RunAlreadyExistsError, RunNotFoundError, StepNotFoundError, StepExecutionError, InvalidPayloadError } from "../src/domain/errors";

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
				payload: 100
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
				payload: 100
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
				payload: 100
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
				payload: 100
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
				payload: 100
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
				payload: 100
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
				payload: 100
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
});

