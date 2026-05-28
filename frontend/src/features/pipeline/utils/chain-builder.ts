import type { Edge } from "@xyflow/react";
import type { CanvasNode, CanvasOperationNode } from "../types/canvas-node";

export function buildChainFromCanvas(
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

	const initNode = nodes.find((node) => node.type === "init");
	if (!initNode) return [];

	const initEdge = edges.find((edge) => edge.source === initNode.id);
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
