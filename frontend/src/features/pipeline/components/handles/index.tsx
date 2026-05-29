import { CanvasHandle } from "./canvas";
import { ExecutionHandle } from "./execution";
import { PipelineHandle } from "./pipeline";
import { RunHandle } from "./run";

export function Handles() {
	return (
		<>
			<RunHandle />
			<PipelineHandle />
			<CanvasHandle />
			<ExecutionHandle />
		</>
	);
}
