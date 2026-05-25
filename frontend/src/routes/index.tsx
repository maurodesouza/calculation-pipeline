import { createFileRoute } from "@tanstack/react-router";
import { Clickable } from "#/components/ui/clickable";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<main>
			<h1>Calculation Pipeline</h1>

			<Clickable.Link to="/pipelines">Pipelines</Clickable.Link>
		</main>
	);
}
