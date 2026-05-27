import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { pipelineRoutes } from "./features/pipeline/routes";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree as generatedRouteTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const dynamicRoutes = [...pipelineRoutes()];
	const routeTree = generatedRouteTree.addChildren(dynamicRoutes);

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
