import { Clickable } from "#/components/ui/clickable";
import { events } from "#/events/index";
import { useTransition } from "#/hooks/use-transition";

export function SaveButton() {
	const isSaving = useTransition(["pipelines.save"]);
	const isCreatingRun = useTransition(["creating-run"]);

	return (
		<Clickable.Button
			tone="success"
			variant="solid"
			disabled={isSaving || isCreatingRun}
			onClick={() => events.pipelines.save()}
		>
			{isSaving ? "Saving..." : "Save"}
		</Clickable.Button>
	);
}
