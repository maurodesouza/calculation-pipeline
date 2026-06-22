import { useSelector } from "@tanstack/react-store";
import { Pause, Play } from "lucide-react";
import { Clickable } from "#/components/ui/clickable";
import { actions } from "#/lib/command";
import { usePipelineContext } from "../../../store";

export function ToggleButton() {
	const { store } = usePipelineContext();
	const runId = useSelector(store, (state) => state.run.id);
	const runStatus = useSelector(store, (state) => state.run.status);
	const isRunning = runStatus === "pending" || runStatus === "started";
	const isPaused = runStatus === "paused";
	const instanceId = useSelector(store, (state) => state.instanceId);

	if (isPaused) {
		return (
			<Clickable.Button
				tone="brand"
				variant="ghost"
				size="icon"
				onClick={() =>
					runId && actions.pipelines.run.resume({ runId }, { instanceId })
				}
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
			onClick={() =>
				runId && actions.pipelines.run.pause({ runId }, { instanceId })
			}
			disabled={!isRunning}
			title="Pause run"
		>
			<Pause size={16} />
		</Clickable.Button>
	);
}
