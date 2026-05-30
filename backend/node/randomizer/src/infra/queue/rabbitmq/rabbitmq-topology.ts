export const rabbitQMTopology = [
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
			name: "processor.randomize",
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
			name: "multiply.randomize",
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
			name: "sum.randomize",
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
			name: "divide.randomize",
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
			name: "subtract.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "randomizer",
				bindings: ["#"],
			},
		],
	},
];
