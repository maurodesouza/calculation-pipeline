import { createRoute } from "@tanstack/react-router";
import { useRef } from "react";

import { Page } from "#/components/ui/page";
import { Route as RootRoute } from "#/routes/__root";
import { Canvas } from "../components/canvas";
import { Handles } from "../components/handles";
import { Header } from "../components/header";
import { StepsPanel } from "../components/panels/steps";
import { getPipelineQueryOptions } from "../lib/react-query/get-pipeline-query-options";
import { createPipelineStore, PipelineStoreProvider } from "../store";

export const PipelineCanvasRoute = createRoute({
	getParentRoute: () => RootRoute,
	path: "/pipelines/$id",
	component: PipelineCanvas,
	loader: async ({ context: { queryClient }, params: { id } }) => {
		if (id === "new") return null;

		return await queryClient.fetchQuery(getPipelineQueryOptions(id));
	},
});

function PipelineCanvas() {
	const pipeline = PipelineCanvasRoute.useLoaderData();

	const storeRef = useRef<ReturnType<typeof createPipelineStore>>(null);

	if (!storeRef.current) {
		storeRef.current = createPipelineStore(pipeline);
	}

	return (
		<Page.Container>
			<PipelineStoreProvider value={{ store: storeRef.current }}>
				<div className="flex w-full h-full">
					<StepsPanel />

					<div className="flex-1 flex flex-col">
						<Header.Container>
							<Header.NameInput />
							<Header.SaveButton />
						</Header.Container>
						<Canvas />
					</div>
				</div>

				<Handles />
			</PipelineStoreProvider>
		</Page.Container>
	);
}
