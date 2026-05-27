import type { Store } from "@tanstack/react-store";
import { createStore, createStoreContext } from "@tanstack/react-store";
import type { Edge, Node } from "@xyflow/react";
import { json } from "#/utils/json";

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

export function createPipelineStore(pipeline?: Record<string, unknown>) {
	const canvas = json.safeParser<Canvas>(
		pipeline?.canvas as string,
		INITIAL_CANVAS_STATE,
	);

	return createStore({
		rawPipeline: pipeline || {},

		id: (pipeline?.id as string) || "new",
		name: (pipeline?.name as string) || "",
		description: (pipeline?.description as string) || "",

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
