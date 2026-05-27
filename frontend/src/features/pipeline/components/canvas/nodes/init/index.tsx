import type { Node, NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { Canvas } from "#/components/ui/canvas";
import { events } from "#/events/index";

type InitNodeData = Node<Record<string, never>, "init">;

export function InitNode(_props: NodeProps<InitNodeData>) {
	return (
		<Canvas.Node.IconWrapper
			variant="success"
			onClick={() => events.pipelines.run.panel.open()}
		>
			<Play size={32} fill="currentColor" />
			<Canvas.Handle.Source position={Canvas.Position.Right} />
		</Canvas.Node.IconWrapper>
	);
}
