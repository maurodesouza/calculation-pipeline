export const rabbitQMTopology = [
	//#region Publish: Randomizer
	{
		exchange: {
			name: "processor.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomize",
				bindings: ["#"],
			},
		],
	},
	//#endregion

	//#region Consume: API events
	{
		exchange: {
			name: "api.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "processor.run.created",
				bindings: ["run.created"],
			},
			{
				name: "processor.run.pause-requested",
				bindings: ["run.pause-requested"],
			},
			{
				name: "processor.run.resume-requested",
				bindings: ["run.resume-requested"],
			},
			{
				name: "processor.run.finalize-requested",
				bindings: ["run.finalize-requested"],
			},
		],
	},
	//#endregion

	//#region Consume: Calculation service responses
	{
		exchange: {
			name: "multiply.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	{
		exchange: {
			name: "sum.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	{
		exchange: {
			name: "divide.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	{
		exchange: {
			name: "subtract.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	//#endregion

	//#region Publish: Run actions to realtime and randomize
	{
		exchange: {
			name: "processor.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "api.run.started",
				bindings: ["run.started"],
			},
			{
				name: "api.run.failed",
				bindings: ["run.failed"],
			},
			{
				name: "api.run.completed",
				bindings: ["run.completed"],
			},
			// Execution requested events
			{
				name: "sum.execution.requested",
				bindings: ["execution.sum-requested"],
			},
			{
				name: "subtract.execution.requested",
				bindings: ["execution.subtraction-requested"],
			},
			{
				name: "multiply.execution.requested",
				bindings: ["execution.multiplication-requested"],
			},
			{
				name: "divide.execution.requested",
				bindings: ["execution.division-requested"],
			},
			{
				name: "api.unknown-execution.requested",
				bindings: ["execution.unknown-requested"],
			},
		],
	},
	//#endregion
];
