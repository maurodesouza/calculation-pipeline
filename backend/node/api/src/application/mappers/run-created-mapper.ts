import { Pipeline } from "../../domain/entities/pipeline";
import { Run } from "../../domain/entities/run";

export class RunCreatedMapper {
	static toPayload(run: Run, pipeline: Pipeline) {
		return {
			runId: run.getId(),
			payload: run.getPayload(),
			steps: pipeline.getSteps().map((step) => ({
				id: step.getId(),
				operation: step.getOperation(),
				by: step.getBy(),
				nextStepId: step.getNextStepId(),
			})),
		};
	}
}
