import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { events } from "#/events/index";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import globalCss from "../styles/global.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Claculation Pipeline",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: globalCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const source = new EventSource("http://localhost:3500/events");

		source.onmessage = (event) => {
			const { event: eventName, payload } = JSON.parse(event.data);
			events.emit(eventName, payload);
		};

		return () => source.close();
	}, []);

	return (
		<html lang="en" suppressHydrationWarning className="theme-dark">
			<head>
				<HeadContent />
			</head>

			<body className="font-sans antialiased tone palette-brand base-1">
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
