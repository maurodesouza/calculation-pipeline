import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	addEdge,
	applyNodeChanges,
	type Connection,
	type Node,
	type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { events } from "#/events";
import { PipelineEvents } from "#/features/pipeline/events";
import { queryClient } from "#/integrations/tanstack-query/root-provider";
import { array } from "#/utils/array";
import { getPipelineQueryOptions } from "../../lib/react-query/get-pipeline-query-options";
import { getPipelinesQueryOptions } from "../../lib/react-query/get-pipelines-query-options";
import { savePipelineMutationOptions } from "../../lib/react-query/save-pipeline-mutation-options";
import { usePipelineContext } from "../../store";

export function CanvasHandle() {
	const { store } = usePipelineContext();
	const navigate = useNavigate({ from: "/pipelines/$id" as never });

	const savePipelineMutation = useMutation(savePipelineMutationOptions());

	const onAddNode = useCallback(
		(node: Node | Node[]) => {
			const nodes = array.toArray(node);

			store.setState((state) => ({
				...state,
				nodes: [...state.nodes, ...nodes],
			}));
		},
		[store],
	);

	const onChangeNodes = useCallback(
		(changes: NodeChange[]) => {
			store.setState((state) => ({
				...state,
				nodes: applyNodeChanges(changes, state.nodes),
			}));
		},
		[store],
	);

	const onEdgeConnect = useCallback(
		(connection: Connection) => {
			store.setState((state) => ({
				...state,
				edges: addEdge(connection, state.edges),
			}));
		},
		[store],
	);

	const createPipeline = useCallback(async () => {
		const state = store.get();

		const result = await savePipelineMutation.mutateAsync({
			id: state.id,
			name: state.name,
			description: state.description,
			canvas: JSON.stringify({
				nodes: state.nodes,
				edges: state.edges,
			}),
		});

		queryClient.invalidateQueries(getPipelinesQueryOptions());

		if (state.id === "new") {
			navigate({
				to: "/pipelines/$id" as never,
				params: {
					id: result.id,
				} as never,
			});

			return;
		}

		queryClient.invalidateQueries(getPipelineQueryOptions(state.id));
	}, [savePipelineMutation, store, navigate]);

	useEffect(() => {
		const unsubscribe1 = events.on(PipelineEvents.CANVAS_NODES_ADD, onAddNode);
		const unsubscribe2 = events.on(
			PipelineEvents.CANVAS_NODES_CHANGE,
			onChangeNodes,
		);
		const unsubscribe3 = events.on(
			PipelineEvents.CANVAS_EDGES_CONNECT,
			onEdgeConnect,
		);

		const unsubscribe4 = events.on(
			PipelineEvents.SAVE_PIPELINE,
			createPipeline,
		);

		return () => {
			unsubscribe1();
			unsubscribe2();
			unsubscribe3();
			unsubscribe4();
		};
	}, [onAddNode, onChangeNodes, onEdgeConnect, createPipeline]);

	return null;
}
