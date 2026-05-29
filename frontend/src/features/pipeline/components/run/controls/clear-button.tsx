import { Trash2 } from "lucide-react";
import { Clickable } from "#/components/ui/clickable";
import { events } from "#/events/index";
import { PipelineEvents } from "../../../events";

export function ClearButton() {
	return (
		<Clickable.Button
			tone="danger"
			variant="ghost"
			size="icon"
			onClick={() => events.emit(PipelineEvents.EXECUTION_CLEAR)}
			title="Clear execution history"
		>
			<Trash2 size={16} />
		</Clickable.Button>
	);
}
