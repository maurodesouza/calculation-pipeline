import { useSelector } from "@tanstack/react-store";
import { Square } from "lucide-react";
import { Clickable } from "#/components/ui/clickable";
import { events } from "#/events/index";
import { usePipelineContext } from "../../../store";

export function FinalizeButton() {
	const { store } = usePipelineContext();
	const runId = useSelector(store, (state) => state.run.id);
	const runStatus = useSelector(store, (state) => state.run.status);
	const isRunning = runStatus === "pending" || runStatus === "started";
	const isPaused = runStatus === "paused";

	return (
		<Clickable.Button
			tone="danger"
			variant="ghost"
			size="icon"
			onClick={() => runId && events.pipelines.run.finalize({ runId })}
			disabled={!isRunning && !isPaused}
			title="Finalize run"
		>
			<Square size={16} />
		</Clickable.Button>
	);
}
