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
import { Loader } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Text } from "#/components/ui/text";
import { twx } from "#/utils/tailwind";

const Container = twx.div`base-1 relative z-10 w-full h-full`;

type CanvasContextValue = {
	isReady: boolean;
	setIsReady: (ready: boolean) => void;
};

const CanvasContext = createContext<CanvasContextValue | null>(null);

function useCanvasContext() {
	const context = useContext(CanvasContext);
	if (!context) {
		throw new Error("useCanvasContext must be used within Canvas.Root");
	}
	return context;
}

function Root({ children }: { children: React.ReactNode }) {
	const [isReady, setIsReady] = useState(false);

	return (
		<CanvasContext.Provider value={{ isReady, setIsReady }}>
			{children}
		</CanvasContext.Provider>
	);
}

function Flow(props: ReactFlowProps) {
	const { isReady, setIsReady } = useCanvasContext();

	return (
		<ReactFlow
			{...props}
			onInit={(instance) => {
				props.onInit?.(instance);
				instance.fitView({ duration: 0, padding: 0.2 });
				setIsReady(true);
			}}
			style={{
				opacity: isReady ? 1 : 0,
				transition: "opacity 0.2s",
			}}
		/>
	);
}

function Overlay() {
	const { isReady } = useCanvasContext();

	if (isReady) return null;

	return (
		<div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
			<ReactFlow>
				<Background />
			</ReactFlow>

			<div className="absolute">
				<Loader size={64} className="animate-spin" />
			</div>
		</div>
	);
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
	Root,
	Container,
	Flow,
	Overlay,
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
