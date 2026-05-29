import { useSelector } from "@tanstack/react-store";
import { Loader, Play } from "lucide-react";
import { useCallback } from "react";
import { Clickable } from "#/components/ui/clickable";
import { events } from "#/events/index";
import { useTransition } from "#/hooks/use-transition";
import { usePipelineContext } from "../../../store";

export function PlayButton() {
	const { store } = usePipelineContext();
	const isCreating = useTransition(["creating-run"]);
	const payload = useSelector(store, (state) => state.run.payload);
	const runStatus = useSelector(store, (state) => state.run.status);
	const isRunning = runStatus === "pending" || runStatus === "started";
	const isPaused = runStatus === "paused";

	const onCreateRun = useCallback(() => {
		events
			.sequence(undefined, {
				transition: ["creating-run"],
			})
			.step(() => events.pipelines.save())
			.step(([{ pipelineId }]) =>
				events.pipelines.run.create({ pipelineId, payload }),
			)
			.run();
	}, [payload]);

	const disabled = isCreating || isRunning || isPaused;

	return (
		<Clickable.Button
			tone="success"
			variant="ghost"
			size="icon"
			onClick={onCreateRun}
			disabled={disabled}
			title="Start run"
		>
			{disabled ? (
				<Loader size={16} className="animate-spin" />
			) : (
				<Play size={16} />
			)}
		</Clickable.Button>
	);
}
