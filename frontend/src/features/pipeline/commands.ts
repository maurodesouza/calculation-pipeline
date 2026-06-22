import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import type { Action, ScopedAction } from "#/lib/command/types";
import type { Renderable } from "#/types/renderable";
import type { CanvasNode, CanvasOperationNode } from "./types/canvas-node";

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

declare module "#/lib/command/global" {
	interface Actions {
		pipelines: {
			save: Action<undefined, { pipelineId: string }[]>;
			update: {
				name: Action<string, void>;
			};

			panel: {
				show: ScopedAction<Renderable, void>;
				clear: ScopedAction<undefined, void>;
			};

			run: {
				create: ScopedAction<CreateRunPayload, { runId: string }[]>;
				pause: ScopedAction<PauseRunPayload, { success: boolean }[]>;
				resume: ScopedAction<ResumeRunPayload, { success: boolean }[]>;
				finalize: ScopedAction<FinalizeRunPayload, { success: boolean }[]>;
				finalized: ScopedAction<RunFinalizedPayload, void>;
				update: {
					payload: ScopedAction<RunUpdatePayloadPayload, void>;
				};
			};

			execution: {
				clear: ScopedAction<undefined, void>;
			};

			canvas: {
				nodes: {
					add: ScopedAction<CanvasNode | CanvasNode[], void>;
					remove: ScopedAction<string | string[], void>;
					change: ScopedAction<NodeChange[], void>;
					duplicate: ScopedAction<string, void>;
					updateData: ScopedAction<NodeUpdateDataPayload, void>;
				};
				edges: {
					connect: ScopedAction<Connection, void>;
					change: ScopedAction<EdgeChange[], void>;
					remove: ScopedAction<string | string[], void>;
				};
			};
		};
	}
}
