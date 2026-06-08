export const rabbitQMTopology = [
	//#region Publish: Randomizer
	{
		exchange: {
			name: "node.processor.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.randomize",
				bindings: ["#"],
			},
		],
	},
	//#endregion

	//#region Consume: API events
	{
		exchange: {
			name: "node.api.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.processor.run.created",
				bindings: ["run.created"],
			},
			{
				name: "node.processor.run.pause-requested",
				bindings: ["run.pause-requested"],
			},
			{
				name: "node.processor.run.resume-requested",
				bindings: ["run.resume-requested"],
			},
			{
				name: "node.processor.run.finalize-requested",
				bindings: ["run.finalize-requested"],
			},
		],
	},
	//#endregion

	//#region Consume: Calculation service responses
	{
		exchange: {
			name: "node.multiply.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	{
		exchange: {
			name: "node.sum.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	{
		exchange: {
			name: "node.divide.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	{
		exchange: {
			name: "node.subtract.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.processor.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
	//#endregion

	//#region Publish: Run actions to realtime and randomize
	{
		exchange: {
			name: "node.processor.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.api.run.started",
				bindings: ["run.started"],
			},
			{
				name: "node.api.run.failed",
				bindings: ["run.failed"],
			},
			{
				name: "node.api.run.completed",
				bindings: ["run.completed"],
			},
			// Execution requested events
			{
				name: "node.sum.execution.requested",
				bindings: ["execution.sum-requested"],
			},
			{
				name: "node.subtract.execution.requested",
				bindings: ["execution.subtraction-requested"],
			},
			{
				name: "node.multiply.execution.requested",
				bindings: ["execution.multiplication-requested"],
			},
			{
				name: "node.divide.execution.requested",
				bindings: ["execution.division-requested"],
			},
			{
				name: "node.api.unknown-execution.requested",
				bindings: ["execution.unknown-requested"],
			},
		],
	},
	//#endregion
];
