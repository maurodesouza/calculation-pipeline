import { mutationOptions } from "@tanstack/react-query";
import axios from "axios";
import type { StepInput } from "../../types/pipeline";

type SyncStepsPayload = {
	pipelineId: string;
	steps: StepInput[];
};

type SyncStepsResult = {
	created: number;
	updated: number;
	deleted: number;
};

export function syncStepsMutationOptions() {
	return mutationOptions({
		mutationFn: async (payload: SyncStepsPayload): Promise<SyncStepsResult> => {
			const response = await axios.put(
				`http://localhost:3000/pipelines/${payload.pipelineId}/steps`,
				payload.steps,
			);
			return response.data;
		},
		mutationKey: ["sync-steps"],
	});
}
