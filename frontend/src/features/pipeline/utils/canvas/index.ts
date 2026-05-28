import type { Edge, XYPosition } from "@xyflow/react";
import type {
	CanvasNode,
	CanvasOperationNode,
} from "#/features/pipeline/types/canvas-node";
import { random } from "#/utils/random";
import type { StepInput } from "../../types/pipeline";

function buildChainFromCanvas(
	nodes: CanvasNode[],
	edges: Edge[],
): CanvasOperationNode[] {
	const operationNodes = nodes.filter((node) => node.type === "operation");

	if (operationNodes.length === 0) {
		return [];
	}

	const nodeMap = new Map<string, CanvasOperationNode>();

	for (const node of nodes) {
		nodeMap.set(node.id, node as CanvasOperationNode);
	}

	const edgeMap = new Map<string, string>();
	for (const edge of edges) {
		edgeMap.set(edge.source, edge.target);
	}

	const steps: CanvasOperationNode[] = [];
	const visited = new Set<string>();

	const initNode = nodes.find(canvas.nodes.find.byType("init"));
	if (!initNode) return [];

	const initEdge = edges.find(canvas.edges.find.bySource(initNode.id));
	if (!initEdge) return [];

	let curNode = nodeMap.get(initEdge.target);

	while (curNode && !visited.has(curNode.id)) {
		visited.add(curNode.id);

		const nextStepId = edgeMap.get(curNode.id);
		steps.push(curNode);
		curNode = nextStepId ? nodeMap.get(nextStepId) : undefined;
	}

	return steps;
}

export const canvas = {
	chain: {
		build: buildChainFromCanvas,
	},

	nodes: {
		create: (
			type: "init" | "operation",
			position: XYPosition,
			payload = {},
		): CanvasNode => {
			return {
				id: random.uuid(),
				type,
				position,
				data: payload,

				draggable: true,
				selectable: true,
				focusable: true,
			} as CanvasNode;
		},

		find: {
			byId: (id: string) => (node: CanvasNode) => {
				return node.id === id;
			},

			byType: (type: string) => (node: CanvasNode) => {
				return node.type === type;
			},
		},

		filter: {
			byType: (type: string) => (node: CanvasNode) => {
				return node.type === type;
			},

			removeIds: (ids: string[]) => (node: CanvasNode) => {
				return !ids.includes(node.id);
			},
		},

		map: {
			updateData:
				<T>(id: string, data: T) =>
				(node: CanvasNode) => {
					if (node.id !== id) return node;

					return {
						...node,
						data: {
							...node.data,
							...data,
						},
					};
				},
			toStepInput:
				() =>
				(
					node: CanvasOperationNode,
					index: number,
					arr: CanvasOperationNode[],
				): StepInput => {
					return {
						id: node.id,
						operation: node.data.props.operation,
						by: node.data.props.by,
						nextStepId: arr[index + 1]?.id,
					};
				},
		},
	},

	edges: {
		find: {
			bySource: (id: string) => (edge: Edge) => {
				return edge.source === id;
			},
		},
		filter: {
			removeIds: (ids: string[]) => (edge: Edge) => {
				return !ids.includes(edge.id);
			},

			removeFromIds: (ids: string[]) => (edge: Edge) => {
				return !ids.includes(edge.source) && !ids.includes(edge.target);
			},
		},
	},
};
