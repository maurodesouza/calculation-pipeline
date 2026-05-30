export const rabbitQMTopology = [
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
	{
		exchange: {
			name: "api.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomizer",
				bindings: ["#"],
			},
		],
	},
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
		],
	},
];
