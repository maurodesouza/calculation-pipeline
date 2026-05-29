import { mutationOptions } from "@tanstack/react-query";
import axios from "axios";

type PauseRunPayload = {
	runId: string;
};

type PauseRunResult = {
	success: boolean;
};

export function pauseRunMutationOptions() {
	return mutationOptions({
		mutationFn: async (payload: PauseRunPayload): Promise<PauseRunResult> => {
			const response = await axios.post(
				`http://localhost:3000/runs/${payload.runId}/pause`,
			);
			return response.data;
		},
		mutationKey: ["pause-run"],
	});
}
