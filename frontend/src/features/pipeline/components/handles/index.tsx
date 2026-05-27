import { CanvasHandle } from "./canvas";
import { PipelineHandle } from "./pipeline";

export function Handles() {
	return (
		<>
			<PipelineHandle />
			<CanvasHandle />
		</>
	);
}
