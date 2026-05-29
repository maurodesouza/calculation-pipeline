import type { Store } from "@tanstack/react-store";
import { createStore, createStoreContext } from "@tanstack/react-store";
import type { Edge } from "@xyflow/react";
import { json } from "#/utils/json";
import { random } from "#/utils/random";
import type { CanvasNode } from "../types/canvas-node";
import type { Pipeline } from "../types/pipeline";

type Canvas = {
	nodes: CanvasNode[];
	edges: Edge[];
};

type RunStatus =
	| "idle"
	| "pending"
	| "started"
	| "paused"
	| "completed"
	| "failed";

type PipelineStore = Canvas & {
	rawPipeline: Record<string, unknown>;
	id: string;
	name: string;
	description: string;
	run: {
		id: string | null;
		status: RunStatus;
		payload: number;
	};
};

const INITIAL_CANVAS_STATE = {
	nodes: [
		{
			id: "n1",
			position: { x: 0, y: 0 },
			type: "init",
			data: {},
			draggable: false,
			selectable: true,
			focusable: true,
		},
	] as CanvasNode[],
	edges: [],
};

export function createPipelineStore(pipeline?: Pipeline) {
	const canvas = json.safeParser<Canvas>(
		pipeline?.canvas || "",
		INITIAL_CANVAS_STATE,
	);

	const id = pipeline?.id || "new";
	const name = pipeline?.name || `new-pipeline-${random.id(5)}`;

	return createStore({
		rawPipeline: pipeline || {},

		id,
		name,
		description: pipeline?.description || "",
		run: { id: null, status: "idle" as const, payload: 0 },

		nodes: canvas?.nodes || [],
		edges: canvas?.edges || [],
	});
}

type PipelineStoreContextValue = {
	store: Store<PipelineStore>;
};

export const {
	StoreProvider: PipelineStoreProvider,
	useStoreContext: usePipelineContext,
} = createStoreContext<PipelineStoreContextValue>();
