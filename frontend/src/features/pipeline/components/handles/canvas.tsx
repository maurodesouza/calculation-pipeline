import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	type Connection,
	type Edge,
	type EdgeChange,
	MarkerType,
	type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { events } from "#/events";
import { PipelineEvents } from "#/features/pipeline/events";
import { array } from "#/utils/array";
import { usePipelineContext } from "../../store";
import type { CanvasNode, CanvasOperationNode } from "../../types/canvas-node";
import { canvas } from "../../utils/canvas";

export function CanvasHandle() {
	const { store } = usePipelineContext();

	const onAddNode = useCallback(
		(node: CanvasNode | CanvasNode[]) => {
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
				nodes: applyNodeChanges(changes, state.nodes) as CanvasNode[],
			}));
		},
		[store],
	);

	const onRemoveNode = useCallback(
		(nodeIds: string | string[]) => {
			const ids = array.toArray(nodeIds);
			store.setState((state) => ({
				...state,
				nodes: state.nodes.filter(canvas.nodes.filter.removeIds(ids)),
				edges: state.edges.filter(canvas.edges.filter.removeFromIds(ids)),
			}));
		},
		[store],
	);

	const onDuplicateNode = useCallback(
		(nodeId: string) => {
			store.setState((state) => {
				const node = state.nodes.find(canvas.nodes.find.byId(nodeId));
				if (!node) return state;

				const newNode = canvas.nodes.create(
					node.type,
					{
						x: node.position.x + 150,
						y: node.position.y,
					},
					node.data,
				);

				return {
					...state,
					nodes: [...state.nodes, newNode],
				};
			});
		},
		[store],
	);

	const onUpdateNodeData = useCallback(
		({
			id,
			data,
		}: {
			id: string;
			data: Partial<CanvasOperationNode["data"]>;
		}) => {
			store.setState((state) => ({
				...state,
				nodes: state.nodes.map(
					canvas.nodes.map.updateData(id, data),
				) as CanvasNode[],
			}));
		},
		[store],
	);

	const onEdgeConnect = useCallback(
		(connection: Connection) => {
			const edge = {
				...connection,
				type: "default",
				markerEnd: {
					type: MarkerType.ArrowClosed,
				},
				style: {
					strokeWidth: 20,
					width: 20,
				},
			} as Edge;

			store.setState((state) => ({
				...state,
				edges: addEdge(edge, state.edges),
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
				edges: state.edges.filter(canvas.edges.filter.removeIds(ids)),
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
			PipelineEvents.CANVAS_NODES_REMOVE,
			onRemoveNode,
		);
		const unsubscribe4 = events.on(
			PipelineEvents.CANVAS_NODES_DUPLICATE,
			onDuplicateNode,
		);
		const unsubscribe5 = events.on(
			PipelineEvents.CANVAS_NODES_UPDATE_DATA,
			onUpdateNodeData,
		);
		const unsubscribe6 = events.on(
			PipelineEvents.CANVAS_EDGES_CONNECT,
			onEdgeConnect,
		);
		const unsubscribe7 = events.on(
			PipelineEvents.CANVAS_EDGES_CHANGE,
			onChangeEdges,
		);
		const unsubscribe8 = events.on(
			PipelineEvents.CANVAS_EDGES_REMOVE,
			onRemoveEdge,
		);

		return () => {
			unsubscribe1();
			unsubscribe2();
			unsubscribe3();
			unsubscribe4();
			unsubscribe5();
			unsubscribe6();
			unsubscribe7();
			unsubscribe8();
		};
	}, [
		onAddNode,
		onChangeNodes,
		onRemoveNode,
		onDuplicateNode,
		onUpdateNodeData,
		onEdgeConnect,
		onChangeEdges,
		onRemoveEdge,
	]);

	return null;
}
