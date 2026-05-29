import type { NodeProps } from "@xyflow/react";
import {
	Check,
	Copy,
	Divide,
	Loader,
	Minus,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { Canvas } from "#/components/ui/canvas";
import { ContextMenu } from "#/components/ui/context-menu";
import { events } from "#/events";
import { EditNodePanel } from "#/features/pipeline/components/panels/edit-node";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";

const operationIcons = {
	sum: Plus,
	subtract: Minus,
	divide: Divide,
	multiply: X,
};

const operationPalette = {
	sum: "brand",
	subtract: "warning",
	divide: "warning",
	multiply: "brand",
} as const;

function getExecutionVisuals(
	execution: CanvasOperationNode["data"]["execution"],
	operationPaletteVariant: string,
) {
	if (!execution) {
		return {
			icon: null,
			variant: operationPaletteVariant,
			className: "",
		};
	}

	const { state } = execution;

	if (state === "pending") {
		return {
			icon: null,
			variant: operationPaletteVariant,
			className: "opacity-50",
		};
	}

	if (state === "running") {
		return {
			icon: <Loader size={32} className="animate-spin" />,
			variant: operationPaletteVariant,
			className: "",
		};
	}

	if (state === "completed") {
		return {
			icon: <Check size={32} />,
			variant: "success",
			className: "",
		};
	}

	if (state === "failed") {
		return {
			icon: <X size={32} />,
			variant: "danger",
			className: "",
		};
	}

	return {
		icon: null,
		variant: operationPaletteVariant,
		className: "",
	};
}

export function OperationNode(props: NodeProps<CanvasOperationNode>) {
	const { data, id, selected } = props;

	const operation = data.props.operation;
	const Icon = operationIcons[operation];

	const {
		icon: executionIcon,
		variant: iconVariant,
		className: executionClassName,
	} = getExecutionVisuals(data.execution, operationPalette[operation]);

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger asChild>
				<Canvas.Node.Container
					variant={selected ? "brand" : "none"}
					className={executionClassName}
					onClick={() =>
						events.pipelines.panel.show(() => (
							<EditNodePanel id={id} initialData={data} />
						))
					}
				>
					<Canvas.Node.IconWrapper variant={iconVariant as never}>
						{executionIcon ?? <Icon size={32} />}
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
