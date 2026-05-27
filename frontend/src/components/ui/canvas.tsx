import {
	Background,
	Controls,
	Handle,
	type HandleProps,
	MiniMap,
	Position,
	ReactFlow,
	type ReactFlowProps,
} from "@xyflow/react";
import { tv, type VariantProps } from "tailwind-variants";
import { Text } from "#/components/ui/text";
import { twx } from "#/utils/tailwind";

const Container = twx.div`base-1 relative z-10 w-full h-full`;

function Flow(props: ReactFlowProps) {
	return <ReactFlow {...props} />;
}

const nodeContainerVariants = tv({
	base: "border border-tone-ring-inner p-lg w-full max-w-32 rounded-md bg-background-default flex flex-col gap-md items-center",
	variants: {
		variant: {
			none: "border-ring-inner",
			brand: "tone palette-brand",
			success: "tone palette-success",
			error: "tone palette-error",
			warning: "tone palette-warning",
		},
	},

	defaultVariants: {
		variant: "none",
	},
});

type NodeContainerProps = React.ComponentProps<"div"> &
	VariantProps<typeof nodeContainerVariants>;

const NodeContainer = twx.div((props: NodeContainerProps) =>
	nodeContainerVariants(props),
);

const iconVariants = tv({
	base: "size-16 grid place-items-center border border-tone-ring-inner rounded-full bg-tone-luminosity-300 text-tone-foreground-contrast",
	variants: {
		variant: {
			brand: "tone palette-brand",
			success: "tone palette-success",
			error: "tone palette-error",
			warning: "tone palette-warning",
		},
	},

	defaultVariants: {
		variant: "brand",
	},
});

type IconWrapperProps = React.ComponentProps<"div"> &
	VariantProps<typeof iconVariants>;

function IconWrapper(props: IconWrapperProps) {
	const { variant, ...rest } = props;

	return <div className={iconVariants({ variant })} {...rest} />;
}

const Label = twx(Text.Strong)``;

const Value = twx(Text.Small)``;

const Content = twx.div`flex flex-col items-center`;

const Node = {
	Container: NodeContainer,
	IconWrapper,
	Label,
	Value,
	Content,
};

type MyHandleProps = Omit<HandleProps, "type">;

function UnStyledTargetHandle(props: MyHandleProps) {
	return <Handle type="target" {...props} />;
}

function UnStyledSourceHandle(props: MyHandleProps) {
	return <Handle type="source" {...props} />;
}

const TargetHandle = twx(UnStyledTargetHandle).attrs({
	type: "target",
})`size-3! border-ring-inner! bg-background-default!`;

const SourceHandle = twx(UnStyledSourceHandle).attrs({
	type: "source",
})`size-3! border-ring-inner! bg-background-default!`;

export const Canvas = {
	Container,
	Flow,
	Node,
	Background,
	MiniMap,
	Position,
	Controls,
	Handle: {
		Target: TargetHandle,
		Source: SourceHandle,
	},
};
