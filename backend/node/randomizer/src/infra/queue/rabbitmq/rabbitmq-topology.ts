export const rabbitQMTopology = [
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
	{
		exchange: {
			name: "node.multiply.randomize",
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
			name: "node.sum.randomize",
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
			name: "node.divide.randomize",
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
			name: "node.subtract.randomize",
			type: "topic" as const,
		},
		queues: [
			{
				name: "node.randomize",
				bindings: ["#"],
			},
		],
	},
];
