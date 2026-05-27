import { Divide, Minus, Plus, X } from "lucide-react";
import { Canvas } from "#/components/ui/canvas";
import { Panel } from "#/components/ui/panel";
import { Text } from "#/components/ui/text";

const steps = [
	{ id: "sum", label: "Sum", icon: Plus, palette: "brand" },
	{ id: "multiply", label: "Multiply", icon: X, palette: "brand" },
	{ id: "subtract", label: "Subtract", icon: Minus, palette: "warning" },
	{ id: "divide", label: "Divide", icon: Divide, palette: "warning" },
];

export function StepsPanel() {
	function onDragStart(event: React.DragEvent) {
		event.dataTransfer.effectAllowed = "move";

		const data = {
			operation: event.currentTarget.getAttribute("data-operation"),
			by: 10,
		};

		event.dataTransfer?.setData("application/json", JSON.stringify(data));
	}

	return (
		<>
			<Panel.Header>
				<Text.Heading>Steps</Text.Heading>
			</Panel.Header>

			<Panel.Body>
				<Panel.Scrollable className="grid grid-cols-2 gap-md items-start content-start">
					{steps.map((step) => {
						const Icon = step.icon;
						return (
							<Canvas.Node.Container
								draggable
								key={step.id}
								className="w-full"
								onDragStart={onDragStart}
								data-operation={step.id}
							>
								<Canvas.Node.IconWrapper variant={step.palette as never}>
									<Icon size={32} />
								</Canvas.Node.IconWrapper>

								<Canvas.Node.Content>
									<Canvas.Node.Label>{step.label}</Canvas.Node.Label>
								</Canvas.Node.Content>
							</Canvas.Node.Container>
						);
					})}
				</Panel.Scrollable>
			</Panel.Body>
		</>
	);
}
