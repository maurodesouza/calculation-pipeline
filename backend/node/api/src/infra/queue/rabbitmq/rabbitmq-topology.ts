export const rabbitQMTopology = [
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
	{
		exchange: {
			name: "node.api.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.randomize",
				bindings: ["#"],
			},
		],
	},
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
		],
	},
];
