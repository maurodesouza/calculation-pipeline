import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	type Connection,
	type EdgeChange,
	type Node,
	type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { events } from "#/events";
import { PipelineEvents } from "#/features/pipeline/events";
import { array } from "#/utils/array";
import { usePipelineContext } from "../../store";

export function CanvasHandle() {
	const { store } = usePipelineContext();

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

	const onChangeEdges = useCallback(
		(changes: EdgeChange[]) => {
			store.setState((state) => ({
				...state,
				edges: applyEdgeChanges(changes, state.edges),
			}));
		},
		[store],
	);

	const onRemoveEdge = useCallback(
		(edgeIds: string | string[]) => {
			const ids = array.toArray(edgeIds);
			store.setState((state) => ({
				...state,
				edges: state.edges.filter((edge) => !ids.includes(edge.id)),
			}));
		},
		[store],
	);

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
			PipelineEvents.CANVAS_EDGES_CHANGE,
			onChangeEdges,
		);
		const unsubscribe5 = events.on(
			PipelineEvents.CANVAS_EDGES_REMOVE,
			onRemoveEdge,
		);

		return () => {
			unsubscribe1();
			unsubscribe2();
			unsubscribe3();
			unsubscribe4();
			unsubscribe5();
		};
	}, [onAddNode, onChangeNodes, onEdgeConnect, onChangeEdges, onRemoveEdge]);

	return null;
}
