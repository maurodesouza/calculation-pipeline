import { useIsMutating } from "@tanstack/react-query";
import { Clickable } from "#/components/ui/clickable";
import { events } from "#/events/index";
import { savePipelineMutationOptions } from "../../lib/react-query/save-pipeline-mutation-options";

export function Header() {
	const isSaving = useIsMutating(savePipelineMutationOptions()) > 0;

	return (
		<header className="p-md w-full flex justify-end border-b border-ring-inner">
			<Clickable.Button
				tone="success"
				variant="solid"
				disabled={isSaving}
				onClick={() => events.pipelines.save()}
			>
				{isSaving ? "Saving..." : "Save"}
			</Clickable.Button>
		</header>
	);
}
