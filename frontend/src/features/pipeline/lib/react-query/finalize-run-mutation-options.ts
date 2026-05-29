import { mutationOptions } from "@tanstack/react-query";
import axios from "axios";

type FinalizeRunPayload = {
	runId: string;
};

type FinalizeRunResult = {
	success: boolean;
};

export function finalizeRunMutationOptions() {
	return mutationOptions({
		mutationFn: async (payload: FinalizeRunPayload): Promise<FinalizeRunResult> => {
			const response = await axios.post(
				`http://localhost:3000/runs/${payload.runId}/finalize`,
			);
			return response.data;
		},
		mutationKey: ["finalize-run"],
	});
}
