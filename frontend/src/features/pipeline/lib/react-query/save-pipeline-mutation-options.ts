import { mutationOptions } from "@tanstack/react-query";
import axios from "axios";
import type { SavePipelinePayload } from "../../types/pipeline";

export function savePipelineMutationOptions() {
	return mutationOptions({
		mutationFn: async (
			payload: SavePipelinePayload,
		): Promise<{ id: string }> => {
			const isCreating = payload.id === "new";
			const method = isCreating ? "post" : "put";
			const url = isCreating ? "" : `/${payload.id}`;

			const response = await axios[method](
				`http://localhost:3000/pipelines${url}`,
				payload,
			);
			return response.data;
		},
		mutationKey: ["save-pipeline"],
	});
}
