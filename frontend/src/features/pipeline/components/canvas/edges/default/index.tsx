import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getBezierPath,
} from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { Clickable } from "#/components/ui/clickable";
import { events } from "#/events";

export function DefaultEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	markerEnd,

	sourcePosition,
	targetPosition,
}: EdgeProps) {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
	});

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				strokeWidth={20}
				width={20}
				style={{
					strokeWidth: 2,
				}}
			/>
			<EdgeLabelRenderer>
				<Clickable.Button
					className="base-1 rounded-full bg-background-default! border! border-ring-inner"
					size="icon"
					variant="ghost"
					tone="danger"
					style={{
						position: "absolute",
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						pointerEvents: "all",
					}}
					onClick={() => events.pipelines.canvas.edges.remove(id)}
				>
					<Trash2 size={16} />
				</Clickable.Button>
			</EdgeLabelRenderer>
		</>
	);
}
