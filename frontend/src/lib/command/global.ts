import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import type {
	CanvasNode,
	CanvasOperationNode,
} from "#/features/pipeline/types/canvas-node";
import type { Renderable } from "#/types/renderable";
import type {
	CreateRunPayload,
	FinalizeRunPayload,
	NodeUpdateDataPayload,
	PauseRunPayload,
	ResumeRunPayload,
	RunFinalizedPayload,
	RunUpdatePayloadPayload,
} from "./payloads";
import type { Config, DispatchConfig } from "./types";

export interface Actions {
	pipelines: {
		save: (config?: DispatchConfig) => Promise<{ pipelineId: string }[]>;
		update: {
			name: (name: string, config?: DispatchConfig) => void;
		};

		panel: {
			show: (panel: Renderable, config: Config) => void;
			clear: (config: Config) => void;
		};

		run: {
			create: (
				payload: CreateRunPayload,
				config: Config,
			) => Promise<{ runId: string }[]>;
			pause: (
				payload: PauseRunPayload,
				config: Config,
			) => Promise<{ success: boolean }[]>;
			resume: (
				payload: ResumeRunPayload,
				config: Config,
			) => Promise<{ success: boolean }[]>;
			finalize: (
				payload: FinalizeRunPayload,
				config: Config,
			) => Promise<{ success: boolean }[]>;
			finalized: (payload: RunFinalizedPayload, config: Config) => void;
			update: {
				payload: (payload: RunUpdatePayloadPayload, config: Config) => void;
			};
		};

		execution: {
			clear: (config: Config) => void;
		};

		canvas: {
			nodes: {
				add: (payload: CanvasNode | CanvasNode[], config: Config) => void;
				remove: (payload: string | string[], config: Config) => void;
				change: (payload: NodeChange[], config: Config) => void;
				duplicate: (payload: string, config: Config) => void;
				updateData: (payload: NodeUpdateDataPayload, config: Config) => void;
			};
			edges: {
				connect: (payload: Connection, config: Config) => void;
				change: (payload: EdgeChange[], config: Config) => void;
				remove: (payload: string | string[], config: Config) => void;
			};
		};
	};
}
