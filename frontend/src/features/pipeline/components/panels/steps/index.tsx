import { Divide, Minus, Plus, X } from "lucide-react";
import { Canvas } from "#/components/ui/canvas";
import { Sidebar } from "#/components/ui/sidebar";
import { Text } from "#/components/ui/text";

const steps = [
	{ id: "sum", label: "Sum", icon: Plus },
	{ id: "subtract", label: "Subtract", icon: Minus },
	{ id: "divide", label: "Divide", icon: Divide },
	{ id: "multiply", label: "Multiply", icon: X },
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
		<Sidebar.Container>
			<Sidebar.Header>
				<Text.Heading>Steps</Text.Heading>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Scrollable className="grid grid-cols-2 gap-md">
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
								<Canvas.Node.IconWrapper>
									<Icon size={32} />
								</Canvas.Node.IconWrapper>

								<Canvas.Node.Content>
									<Canvas.Node.Label>{step.label}</Canvas.Node.Label>
								</Canvas.Node.Content>
							</Canvas.Node.Container>
						);
					})}
				</Sidebar.Scrollable>
			</Sidebar.Content>
		</Sidebar.Container>
	);
}
