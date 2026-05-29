import { mutationOptions } from "@tanstack/react-query";
import axios from "axios";

type ResumeRunPayload = {
	runId: string;
};

type ResumeRunResult = {
	success: boolean;
};

export function resumeRunMutationOptions() {
	return mutationOptions({
		mutationFn: async (payload: ResumeRunPayload): Promise<ResumeRunResult> => {
			const response = await axios.post(
				`http://localhost:3000/runs/${payload.runId}/resume`,
			);
			return response.data;
		},
		mutationKey: ["resume-run"],
	});
}
