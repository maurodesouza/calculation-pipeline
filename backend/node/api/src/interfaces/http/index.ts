import { PipelineController } from "./pipeline-controller";
import { RunController } from "./run-controller";

export const HTTPInterface = {
	initialize() {
		new PipelineController();
		new RunController();
	},
};
