export const rabbitQMTopology = [
	{
		exchange: {
			name: "api.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomize",
				bindings: ["#"],
			},
		],
	},
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
	{
		exchange: {
			name: "multiply.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomize",
				bindings: ["#"],
			},
		],
	},
	{
		exchange: {
			name: "sum.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomize",
				bindings: ["#"],
			},
		],
	},
	{
		exchange: {
			name: "divide.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomize",
				bindings: ["#"],
			},
		],
	},
	{
		exchange: {
			name: "subtract.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomize",
				bindings: ["#"],
			},
		],
	},
];
