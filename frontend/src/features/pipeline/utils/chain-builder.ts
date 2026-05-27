import type { Edge, Node } from "@xyflow/react";
import type { StepInput } from "../types/pipeline";

type OperationNodeData = {
	props: {
		operation: "sum" | "subtract" | "divide" | "multiply";
		by: number;
	};
};

export function buildChainFromCanvas(
	nodes: Node[],
	edges: Edge[],
): StepInput[] {
	const operationNodes = nodes.filter((node) => node.type === "operation");

	if (operationNodes.length === 0) {
		return [];
	}

	const nodeMap = new Map<string, Node>();
	for (const node of nodes) {
		nodeMap.set(node.id, node);
	}

	const edgeMap = new Map<string, string>();
	for (const edge of edges) {
		edgeMap.set(edge.source, edge.target);
	}

	const steps: StepInput[] = [];
	const visited = new Set<string>();

	let currentNode = operationNodes.find((node) => {
		const hasIncomingEdge = edges.some((edge) => edge.target === node.id);
		return !hasIncomingEdge;
	});

	if (!currentNode && operationNodes.length > 0) {
		currentNode = operationNodes[0];
	}

	while (currentNode && !visited.has(currentNode.id)) {
		visited.add(currentNode.id);

		const data = currentNode.data as OperationNodeData;

		const nextStepId = edgeMap.get(currentNode.id);

		steps.push({
			id: currentNode.id,
			operation: data.props.operation,
			by: data.props.by,
			nextStepId,
		});

		currentNode = nextStepId ? nodeMap.get(nextStepId) : undefined;
	}

	return steps;
}
