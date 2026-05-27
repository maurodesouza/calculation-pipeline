import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export function getPipelineQueryOptions(id: string) {
	return queryOptions({
		queryKey: ["pipeline", id],
		queryFn: async () => {
			const response = await axios.get(`http://localhost:3000/pipelines/${id}`);

			return response.data;
		},
	});
}
