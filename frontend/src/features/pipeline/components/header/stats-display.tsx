import { useSelector } from "@tanstack/react-store";
import { Text } from "#/components/ui/text";
import { usePipelineContext } from "../../store";

export function StatsDisplay() {
	const { store } = usePipelineContext();
	const nodesCount = useSelector(store, (state) => state.nodes.length);
	const edgesCount = useSelector(store, (state) => state.edges.length);

	return (
		<div className="flex items-center gap-sm text-sm text-foreground-min">
			<Text.Strong>Nodes: {nodesCount}</Text.Strong>
			<Text.Strong>Edges: {edgesCount}</Text.Strong>
		</div>
	);
}
