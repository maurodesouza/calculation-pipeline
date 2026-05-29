import { useSelector } from "@tanstack/react-store";
import { Pause, Play } from "lucide-react";
import { Clickable } from "#/components/ui/clickable";
import { events } from "#/events/index";
import { usePipelineContext } from "../../../store";

export function ToggleButton() {
	const { store } = usePipelineContext();
	const runId = useSelector(store, (state) => state.run.id);
	const runStatus = useSelector(store, (state) => state.run.status);
	const isRunning = runStatus === "pending" || runStatus === "started";
	const isPaused = runStatus === "paused";

	if (isPaused) {
		return (
			<Clickable.Button
				tone="brand"
				variant="ghost"
				size="icon"
				onClick={() => runId && events.pipelines.run.resume({ runId })}
				title="Resume run"
			>
				<Play size={16} />
			</Clickable.Button>
		);
	}

	return (
		<Clickable.Button
			tone="warning"
			variant="ghost"
			size="icon"
			onClick={() => runId && events.pipelines.run.pause({ runId })}
			disabled={!isRunning}
			title="Pause run"
		>
			<Pause size={16} />
		</Clickable.Button>
	);
}
