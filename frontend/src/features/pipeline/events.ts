import type { Connection, EdgeChange, Node, NodeChange } from "@xyflow/react";

export enum PipelineEvents {
	CANVAS_NODES_ADD = "pipelines.canvas.nodes.add",
	CANVAS_NODES_REMOVE = "pipelines.canvas.nodes.remove",
	CANVAS_NODES_CHANGE = "pipelines.canvas.nodes.change",
	CANVAS_EDGES_CONNECT = "pipelines.canvas.edges.connect",
	CANVAS_EDGES_CHANGE = "pipelines.canvas.edges.change",
	CANVAS_EDGES_REMOVE = "pipelines.canvas.edges.remove",

	SAVE_PIPELINE = "pipelines.save",
	UPDATE_NAME = "pipelines.update.name",
}

declare module "#/events/index" {
	interface Events {
		pipelines: {
			save: () => void;
			update: {
				name: (name: string) => void;
			};

			canvas: {
				nodes: {
					add: (payload: Node | Node[]) => void;
					remove: (payload: string | string[]) => void;
					change: (payload: NodeChange[]) => void;
				};
				edges: {
					connect: (payload: Connection) => void;
					change: (payload: EdgeChange[]) => void;
					remove: (payload: string | string[]) => void;
				};
			};
		};
	}
}
