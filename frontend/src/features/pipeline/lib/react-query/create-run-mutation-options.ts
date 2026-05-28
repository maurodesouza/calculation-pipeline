import { mutationOptions } from "@tanstack/react-query";
import axios from "axios";

type CreateRunPayload = {
	pipelineId: string;
	payload: number;
};

type CreateRunResult = {
	id: string;
};

export function createRunMutationOptions() {
	return mutationOptions({
		mutationFn: async (payload: CreateRunPayload): Promise<CreateRunResult> => {
			const response = await axios.post("http://localhost:3000/runs", payload);
			return response.data;
		},
		mutationKey: ["create-run"],
	});
}
