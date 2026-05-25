import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

type PipelinesQueryOptions = {
	page?: number;
	limit?: number;
	name?: string;
	id?: string;
	sortBy?: "created_at" | "updated_at";
};

export const getPipelinesQueryOptions = (options: PipelinesQueryOptions = {}) =>
	queryOptions({
		queryKey: ["pipelines", options],
		queryFn: async () => {
			const params = new URLSearchParams();

			if (options.page) params.append("page", options.page.toString());
			if (options.limit) params.append("limit", options.limit.toString());
			if (options.name) params.append("name", options.name);
			if (options.id) params.append("id", options.id);
			if (options.sortBy) params.append("sortBy", options.sortBy);

			const response = await axios.get(
				`http://localhost:3000/pipelines?${params.toString()}`,
			);

			return {
				...response.data,
				total: Number(response.data.total || response.data.length),
			};
		},
	});
