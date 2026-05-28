import type { Node } from "@xyflow/react";

export type OperationNodeData = {
	props: {
		operation: "sum" | "subtract" | "divide" | "multiply";
		by: number;
	};
};

export type CanvasInitNode = Node<Record<string, unknown>, "init">;
export type CanvasOperationNode = Node<OperationNodeData, "operation">;

export type CanvasNode = CanvasInitNode | CanvasOperationNode;
