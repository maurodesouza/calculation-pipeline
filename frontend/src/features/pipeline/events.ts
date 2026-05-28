import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import type { Renderable } from "#/types/renderable";
import type { CanvasNode, CanvasOperationNode } from "./types/canvas-node";

export enum PipelineEvents {
	CANVAS_NODES_ADD = "pipelines.canvas.nodes.add",
	CANVAS_NODES_REMOVE = "pipelines.canvas.nodes.remove",
	CANVAS_NODES_CHANGE = "pipelines.canvas.nodes.change",
	CANVAS_NODES_DUPLICATE = "pipelines.canvas.nodes.duplicate",
	CANVAS_NODES_UPDATE_DATA = "pipelines.canvas.nodes.updateData",
	CANVAS_EDGES_CONNECT = "pipelines.canvas.edges.connect",
	CANVAS_EDGES_CHANGE = "pipelines.canvas.edges.change",
	CANVAS_EDGES_REMOVE = "pipelines.canvas.edges.remove",

	SAVE_PIPELINE = "pipelines.save",
	UPDATE_NAME = "pipelines.update.name",

	RUN_PANEL_OPEN = "pipelines.run.panel.open",
	RUN_PANEL_CLOSE = "pipelines.run.panel.close",
}

declare module "#/events/index" {
	interface Events {
		pipelines: {
			save: () => void;
			update: {
				name: (name: string) => void;
			};

			panel: {
				show: (panel: Renderable) => void;
				clear: () => void;
			};

			run: {
				panel: {
					open: () => void;
					close: () => void;
				};
			};

			canvas: {
				nodes: {
					add: (payload: CanvasNode | CanvasNode[]) => void;
					remove: (payload: string | string[]) => void;
					change: (payload: NodeChange[]) => void;
					duplicate: (payload: string) => void;
					updateData: (payload: {
						id: string;
						data: Partial<CanvasOperationNode["data"]>;
					}) => void;
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
