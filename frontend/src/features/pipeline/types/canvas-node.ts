import type { Node } from "@xyflow/react";

export type Operation = "sum" | "subtract" | "divide" | "multiply";

export type ExecutionState = "pending" | "running" | "completed" | "failed";

export type OperationNodeData = {
	props: {
		operation: Operation;
		by: number;
	};
	execution?: {
		state: ExecutionState;
		runId: string;
		result?: number;
		error?: string;
	};
};

export type CanvasInitNode = Node<Record<string, unknown>, "init">;
export type CanvasOperationNode = Node<OperationNodeData, "operation">;

export type CanvasNode = CanvasInitNode | CanvasOperationNode;
