import { Clickable } from "#/components/ui/clickable";
import { useTransition } from "#/hooks/use-transition";
import { actions } from "#/lib/command";
import { usePipelineContext } from "../../store";

export function SaveButton() {
	const { store } = usePipelineContext();
	const isSaving = useTransition(["pipelines.save"]);
	const isCreatingRun = useTransition(["creating-run"]);
	const instanceId = store.state.instanceId;

	return (
		<Clickable.Button
			tone="success"
			variant="solid"
			disabled={isSaving || isCreatingRun}
			onClick={() => actions.pipelines.save(undefined, { instanceId })}
		>
			{isSaving ? "Saving..." : "Save"}
		</Clickable.Button>
	);
}
