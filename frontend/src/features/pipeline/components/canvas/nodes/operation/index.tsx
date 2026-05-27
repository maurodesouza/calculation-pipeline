import type { Node, NodeProps } from "@xyflow/react";
import { Copy, Divide, Minus, Plus, Trash2, X } from "lucide-react";
import { Canvas } from "#/components/ui/canvas";
import { ContextMenu } from "#/components/ui/context-menu";
import { events } from "#/events";

type OperationNodeData = Node<
	{
		props: {
			operation: "sum" | "subtract" | "divide" | "multiply";
			by: number;
		};
	},
	"operation"
>;

const operationIcons = {
	sum: Plus,
	subtract: Minus,
	divide: Divide,
	multiply: X,
};

export function OperationNode(props: NodeProps<OperationNodeData>) {
	const { data, id } = props;

	const operation = data.props.operation;
	const Icon = operationIcons[operation];

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger asChild>
				<Canvas.Node.Container variant={props.selected ? "brand" : "none"}>
					<Canvas.Node.IconWrapper>
						<Icon size={32} />
					</Canvas.Node.IconWrapper>

					<Canvas.Node.Content>
						<Canvas.Node.Label>{operation}</Canvas.Node.Label>
						<Canvas.Node.Value>by: {data.props.by}</Canvas.Node.Value>
					</Canvas.Node.Content>

					<Canvas.Handle.Target position={Canvas.Position.Left} />
					<Canvas.Handle.Source position={Canvas.Position.Right} />
				</Canvas.Node.Container>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item
					onClick={() => events.pipelines.canvas.nodes.duplicate(id)}
				>
					<Copy data-icon="inline-start" />
					Duplicate
				</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item
					tone="danger"
					onClick={() => events.pipelines.canvas.nodes.remove(id)}
				>
					<Trash2 data-icon="inline-start" />
					Delete
				</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
