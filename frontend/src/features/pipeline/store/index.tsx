import type { Store } from "@tanstack/react-store";
import { createStore, createStoreContext } from "@tanstack/react-store";
import type { Edge, Node } from "@xyflow/react";
import { json } from "#/utils/json";
import { random } from "#/utils/random";
import type { Pipeline } from "../types/pipeline";

type Canvas = {
	nodes: Node[];
	edges: Edge[];
};

type PipelineStore = Canvas & {
	rawPipeline: Record<string, unknown>;
	id: string;
	name: string;
	description: string;
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
	] as Node[],
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
