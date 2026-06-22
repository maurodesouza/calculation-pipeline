import type { NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { Canvas } from "#/components/ui/canvas";
import { events } from "#/events/index";
import type { CanvasInitNode } from "#/features/pipeline/types/canvas-node";

export function InitNode(_props: NodeProps<CanvasInitNode>) {
	return (
		<Canvas.Node.IconWrapper
			variant="success"
			onClick={() => events.pipelines.panel.show("run")}
		>
			<Play size={32} fill="currentColor" />
			<Canvas.Handle.Source position={Canvas.Position.Right} />
		</Canvas.Node.IconWrapper>
	);
}
