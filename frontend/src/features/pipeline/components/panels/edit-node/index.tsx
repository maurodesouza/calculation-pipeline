import {
	ChevronLeft,
	Copy,
	Divide,
	Minus,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Clickable } from "#/components/ui/clickable";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Panel } from "#/components/ui/panel";
import { Select } from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";
import { Text } from "#/components/ui/text";
import { events } from "#/events";
import type { Operation } from "#/features/pipeline/types/canvas-node";
import { fn } from "#/utils/fn";
import { StepsPanel } from "../steps";

const operations = [
	{ id: "sum", label: "Sum", icon: Plus },
	{ id: "subtract", label: "Subtract", icon: Minus },
	{ id: "divide", label: "Divide", icon: Divide },
	{ id: "multiply", label: "Multiply", icon: X },
];

type EditNodePanelProps = {
	id: string;

	initialData: {
		props: {
			operation: Operation;
			by: number;
		};
	};
};

export function EditNodePanel(props: EditNodePanelProps) {
	const { id, initialData } = props;

	const updateDataRef = useRef(
		fn.debounce((payload) => {
			updateData(payload);
		}, 500),
	);

	const [operation, setOperation] = useState(initialData.props.operation);
	const [by, setBy] = useState(initialData.props.by);

	function handleOperationChange(value: Operation) {
		setOperation(value);
		updateDataRef.current({
			operation: value,
			by,
		});
	}

	function handleByChange(value: number) {
		setBy(value);

		updateDataRef.current({
			operation,
			by: value,
		});
	}

	function updateData(payload: { operation: Operation; by: number }) {
		events.pipelines.canvas.nodes.updateData({
			id,
			data: {
				props: {
					operation: payload.operation,
					by: payload.by,
				},
			},
		});
	}

	function handleDelete() {
		events.pipelines.canvas.nodes.remove(id);
		handleBackToSteps();
	}

	function handleDuplicate() {
		events.pipelines.canvas.nodes.duplicate(id);
	}

	function handleBackToSteps() {
		events.pipelines.panel.show(() => <StepsPanel />);
	}

	return (
		<>
			<Panel.Header>
				<Clickable.Button
					size="icon"
					variant="icon"
					onClick={handleBackToSteps}
				>
					<ChevronLeft size={24} />
				</Clickable.Button>
				<Text.Heading>Edit</Text.Heading>
			</Panel.Header>
			<Panel.Body>
				<div className="flex flex-col gap-4">
					<Field.Group>
						<Field.Root>
							<Field.Label htmlFor="operation">Operation</Field.Label>
							<Select.Root
								value={operation}
								onValueChange={handleOperationChange}
							>
								<Select.Trigger className="w-full">
									<Select.Value placeholder="Select operation" />
								</Select.Trigger>
								<Select.Content>
									{operations.map((op) => (
										<Select.Item key={op.id} value={op.id}>
											{op.label}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</Field.Root>
						<Field.Root>
							<Field.Label htmlFor="by">By</Field.Label>
							<Input
								id="by"
								type="number"
								value={by}
								onChange={(e) => handleByChange(Number(e.target.value))}
							/>
						</Field.Root>
					</Field.Group>
				</div>
			</Panel.Body>

			<Panel.Footer>
				<div className="flex gap-xs">
					<Clickable.Button tone="danger" size="icon" onClick={handleDelete}>
						<Trash2 size={16} />
					</Clickable.Button>
					<Separator orientation="vertical" />
					<Clickable.Button tone="brand" size="icon" onClick={handleDuplicate}>
						<Copy size={16} />
					</Clickable.Button>
					<Clickable.Button full onClick={handleBackToSteps}>
						<ChevronLeft size={16} />
						Back to Steps
					</Clickable.Button>
				</div>
			</Panel.Footer>
		</>
	);
}
