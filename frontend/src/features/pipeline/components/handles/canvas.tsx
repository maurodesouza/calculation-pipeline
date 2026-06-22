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
import { commands } from "#/lib/command";
import { array } from "#/utils/array";
import { usePipelineContext } from "../../store";
import type { CanvasNode, CanvasOperationNode } from "../../types/canvas-node";
import { canvas } from "../../utils/canvas";

export function CanvasHandle() {
	const { store } = usePipelineContext();
	const pipelineId = store.use((state) => state.id);

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
		const dispose1 = commands.handle("pipelines.canvas.nodes.add", onAddNode, {
			instanceId: pipelineId,
		});
		const dispose2 = commands.handle(
			"pipelines.canvas.nodes.change",
			onChangeNodes,
			{ instanceId: pipelineId },
		);
		const dispose3 = commands.handle(
			"pipelines.canvas.nodes.remove",
			onRemoveNode,
			{ instanceId: pipelineId },
		);
		const dispose4 = commands.handle(
			"pipelines.canvas.nodes.duplicate",
			onDuplicateNode,
			{ instanceId: pipelineId },
		);
		const dispose5 = commands.handle(
			"pipelines.canvas.nodes.updateData",
			onUpdateNodeData,
			{ instanceId: pipelineId },
		);
		const dispose6 = commands.handle(
			"pipelines.canvas.edges.connect",
			onEdgeConnect,
			{ instanceId: pipelineId },
		);
		const dispose7 = commands.handle(
			"pipelines.canvas.edges.change",
			onChangeEdges,
			{ instanceId: pipelineId },
		);
		const dispose8 = commands.handle(
			"pipelines.canvas.edges.remove",
			onRemoveEdge,
			{ instanceId: pipelineId },
		);

		return () => {
			dispose1();
			dispose2();
			dispose3();
			dispose4();
			dispose5();
			dispose6();
			dispose7();
			dispose8();
		};
	}, [
		pipelineId,
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
