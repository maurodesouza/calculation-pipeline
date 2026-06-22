import { createRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Page } from "#/components/ui/page";
import { Panel } from "#/components/ui/panel";
import { Separator } from "#/components/ui/separator";
import { InstanceRegistry } from "#/lib/command/instance-registry";
import { Route as RootRoute } from "#/routes/__root";
import { Canvas } from "../components/canvas";
import { Handles } from "../components/handles";
import { Header } from "../components/header";
import { StepsPanel } from "../components/panels/steps";
import { RunPanel } from "../components/run";
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

	useEffect(() => {
		const instanceId = storeRef.current?.getState().instanceId;
		const name = storeRef.current?.getState().name;
		if (!instanceId) return;

		const registry = InstanceRegistry.getInstance();
		registry.add("pipeline", { id: instanceId, label: name });

		return () => {
			registry.remove("pipeline", instanceId);
		};
	}, []);

	return (
		<Page.Container>
			<PipelineStoreProvider value={{ store: storeRef.current }}>
				<div className="flex flex-col w-full h-full">
					<Header.Container>
						<Header.Wrapper>
							<Header.Controls.GoToListButton />
							<Separator orientation="vertical" />
							<Header.Controls.NameInput />
							<Separator orientation="vertical" />
							<Header.Controls.StatsDisplay />
						</Header.Wrapper>
						<Header.Controls.SaveButton />
					</Header.Container>

					<div className="flex-1 flex">
						<Panel.Template.Full
							context="pipelines"
							initialPanel={<StepsPanel />}
						/>
						<div className="h-full w-full flex flex-col">
							<div className="flex-1">
								<Canvas />
							</div>
							<RunPanel />
						</div>
					</div>
				</div>

				<Handles />
			</PipelineStoreProvider>
		</Page.Container>
	);
}
