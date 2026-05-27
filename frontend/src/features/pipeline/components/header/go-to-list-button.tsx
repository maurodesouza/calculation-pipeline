import { ChevronLeft } from "lucide-react";
import { Clickable } from "#/components/ui/clickable";

export function GoToListButton() {
	return (
		<Clickable.Link to="/pipelines" size="icon" variant="icon">
			<ChevronLeft />
		</Clickable.Link>
	);
}
