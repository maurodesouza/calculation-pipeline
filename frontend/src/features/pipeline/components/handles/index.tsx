import { CanvasHandle } from "./canvas";
import { PipelineHandle } from "./pipeline";
import { RunHandle } from "./run";

export function Handles() {
	return (
		<>
			<RunHandle />
			<PipelineHandle />
			<CanvasHandle />
		</>
	);
}
