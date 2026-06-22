import { useSelector } from "@tanstack/react-store";
import type { ReactFlowInstance } from "@xyflow/react";
import { useCallback, useRef } from "react";
import { Canvas as CanvasUI } from "#/components/ui/canvas";
import { usePipelineContext } from "#/features/pipeline/store";
import { actions } from "#/lib/command";
import { canvas } from "../../utils/canvas";
import { StepsPanel } from "../panels/steps";
import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";

export function Canvas() {
	const { store } = usePipelineContext();
	const flowInstance = useRef<ReactFlowInstance>(null);

	const nodes = useSelector(store, (state) => state.nodes);
	const edges = useSelector(store, (state) => state.edges);
	const instanceId = useSelector(store, (state) => state.instanceId);

	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();

			const data = event.dataTransfer?.getData("application/json");
			if (!data) return;

			const payload = JSON.parse(data);

			const position = flowInstance.current?.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			if (!position) return;

			actions.pipelines.canvas.nodes.add(
				canvas.nodes.create("operation", position, { props: payload }),
				{ instanceId },
			);
		},
		[instanceId],
	);

	function onDragStart(event: React.DragEvent) {
		event.dataTransfer.setData("text/plain", "operation");
		event.dataTransfer.effectAllowed = "move";
	}

	return (
		<CanvasUI.Root>
			<CanvasUI.Container>
				<CanvasUI.Overlay />
				<CanvasUI.Flow
					onInit={(instance) => {
						flowInstance.current = instance;
					}}
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={(event) =>
						actions.pipelines.canvas.nodes.change(event, { instanceId })
					}
					onEdgesChange={(event) =>
						actions.pipelines.canvas.edges.change(event, { instanceId })
					}
					onConnect={(event) =>
						actions.pipelines.canvas.edges.connect(event, { instanceId })
					}
					onDrop={onDrop}
					onDragStart={onDragStart}
					onDragOver={onDragOver}
					deleteKeyCode="Delete"
					onPaneClick={() =>
						actions.pipelines.panel.show(() => <StepsPanel />, { instanceId })
					}
				>
					<CanvasUI.Background />
				</CanvasUI.Flow>
			</CanvasUI.Container>
		</CanvasUI.Root>
	);
}
