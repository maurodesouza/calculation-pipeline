import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import type { Renderable } from "#/types/renderable";
import type { CanvasNode, CanvasOperationNode } from "#/features/pipeline/types/canvas-node";

export type CreateRunPayload = {
	payload: number;
	pipelineId: string;
};

export type PauseRunPayload = {
	runId: string;
};

export type ResumeRunPayload = {
	runId: string;
};

export type FinalizeRunPayload = {
	runId: string;
};

export type RunFinalizedPayload = {
	runId: string;
	error: string;
};

export type RunUpdatePayloadPayload = {
	payload: number;
};

export type NodeUpdateDataPayload = {
	id: string;
	data: Partial<CanvasOperationNode["data"]>;
};
