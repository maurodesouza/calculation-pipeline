import { useSelector } from "@tanstack/react-store";
import type { NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { Canvas } from "#/components/ui/canvas";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasInitNode } from "#/features/pipeline/types/canvas-node";
import { actions } from "#/lib/command";

export function InitNode(_props: NodeProps<CanvasInitNode>) {
	const { store } = usePipelineContext();
	const instanceId = useSelector(store, (state) => state.instanceId);

	return (
		<Canvas.Node.IconWrapper
			variant="success"
			onClick={() => actions.pipelines.panel.show("run", { instanceId })}
		>
			<Play size={32} fill="currentColor" />
			<Canvas.Handle.Source position={Canvas.Position.Right} />
		</Canvas.Node.IconWrapper>
	);
}
