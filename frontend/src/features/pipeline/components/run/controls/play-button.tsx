import { useSelector } from "@tanstack/react-store";
import { Loader, Play } from "lucide-react";
import { useCallback } from "react";
import { Clickable } from "#/components/ui/clickable";
import { useTransition } from "#/hooks/use-transition";
import { actions } from "#/lib/command";
import { usePipelineContext } from "../../../store";

export function PlayButton() {
	const { store } = usePipelineContext();
	const isCreating = useTransition(["creating-run"]);
	const payload = useSelector(store, (state) => state.run.payload);
	const runStatus = useSelector(store, (state) => state.run.status);
	const isRunning = runStatus === "pending" || runStatus === "started";
	const isPaused = runStatus === "paused";
	const instanceId = useSelector(store, (state) => state.instanceId);

	const onCreateRun = useCallback(async () => {
		const [{ pipelineId }] = await actions.pipelines.save(undefined, {
			transition: ["creating-run"],
			instanceId,
		});
		await actions.pipelines.run.create({ pipelineId, payload }, { instanceId });
	}, [payload, instanceId]);

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
