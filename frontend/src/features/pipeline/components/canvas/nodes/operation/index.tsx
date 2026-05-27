import type { Node, NodeProps } from "@xyflow/react";
import { Divide, Minus, Plus, X } from "lucide-react";
import { Canvas } from "#/components/ui/canvas";

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
	const { data } = props;

	const operation = data.props.operation;
	const Icon = operationIcons[operation];

	return (
		<Canvas.Node.Container>
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
	);
}
