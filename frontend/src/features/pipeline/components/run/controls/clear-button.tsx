import { useSelector } from "@tanstack/react-store";
import { Trash2 } from "lucide-react";
import { Clickable } from "#/components/ui/clickable";
import { actions } from "#/lib/command";
import { usePipelineContext } from "../../../store";

export function ClearButton() {
	const { store } = usePipelineContext();
	const instanceId = useSelector(store, (state) => state.instanceId);

	return (
		<Clickable.Button
			tone="danger"
			variant="ghost"
			size="icon"
			onClick={() =>
				actions.pipelines.execution.clear(undefined, { instanceId })
			}
			title="Clear execution history"
		>
			<Trash2 size={16} />
		</Clickable.Button>
	);
}
