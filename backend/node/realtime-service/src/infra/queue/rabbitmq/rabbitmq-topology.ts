export const rabbitQMTopology = [
	{
		exchange: {
			name: "processor.events",
			type: "topic" as const,
		},
		queues: [
			{
				name: "realtime.run.started",
				bindings: ["run.started"],
			},
			{
				name: "realtime.run.failed",
				bindings: ["run.failed"],
			},
			{
				name: "realtime.run.completed",
				bindings: ["run.completed"],
			},
			{
				name: "realtime.run.paused",
				bindings: ["run.paused"],
			},
			{
				name: "realtime.run.resumed",
				bindings: ["run.resumed"],
			},
			{
				name: "realtime.run.finalized",
				bindings: ["run.finalized"],
			},
			{
				name: "realtime.execution.requested",
				bindings: [
					"execution.sum-requested",
					"execution.subtraction-requested",
					"execution.multiplication-requested",
					"execution.division-requested",
					"execution.unknown-requested",
				],
			},
			{
				name: "realtime.step.finished",
				bindings: ["step.finished"],
			},
		],
	},
];
