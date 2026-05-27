import { useSelector } from "@tanstack/react-store";
import type { Node, ReactFlowInstance } from "@xyflow/react";
import { useCallback, useRef } from "react";
import { Canvas as CanvasUI } from "#/components/ui/canvas";
import { events } from "#/events";
import { usePipelineContext } from "#/features/pipeline/store";
import { random } from "#/utils/random";
import { StepsPanel } from "../panels/steps";
import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";

export function Canvas() {
	const { store } = usePipelineContext();
	const flowInstance = useRef<ReactFlowInstance>(null);

	const nodes = useSelector(store, (state) => state.nodes);
	const edges = useSelector(store, (state) => state.edges);

	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback((event: React.DragEvent) => {
		event.preventDefault();

		const data = event.dataTransfer?.getData("application/json");
		if (!data) return;

		const payload = JSON.parse(data);

		const position = flowInstance.current?.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		});

		const newNode = {
			id: random.uuid(),
			type: "operation",
			position,
			data: { props: payload },
			draggable: true,
			selectable: true,
			focusable: true,
		} as Node;

		events.pipelines.canvas.nodes.add(newNode);
	}, []);

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
					onNodesChange={(event) => events.pipelines.canvas.nodes.change(event)}
					onEdgesChange={(event) => events.pipelines.canvas.edges.change(event)}
					onConnect={(event) => events.pipelines.canvas.edges.connect(event)}
					onDrop={onDrop}
					onDragStart={onDragStart}
					onDragOver={onDragOver}
					onPaneClick={() => events.pipelines.panel.show(() => <StepsPanel />)}
				>
					<CanvasUI.Background />
				</CanvasUI.Flow>
			</CanvasUI.Container>
		</CanvasUI.Root>
	);
}
