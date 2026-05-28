import type { Node } from "@xyflow/react";

export type Operation = "sum" | "subtract" | "divide" | "multiply";

export type OperationNodeData = {
	props: {
		operation: Operation;
		by: number;
	};
};

export type CanvasInitNode = Node<Record<string, unknown>, "init">;
export type CanvasOperationNode = Node<OperationNodeData, "operation">;

export type CanvasNode = CanvasInitNode | CanvasOperationNode;
