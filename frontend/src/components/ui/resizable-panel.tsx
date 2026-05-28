import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn, twx } from "#/utils/tailwind";

type ResizablePanelContextState = {
	height: number;
	isDragging: boolean;
	handleRef: React.RefObject<HTMLButtonElement | null>;
	setHeight: (height: number) => void;
	onMouseDown: (e: React.MouseEvent) => void;
};

const ResizablePanelContext = createContext<ResizablePanelContextState>(
	{} as ResizablePanelContextState,
);

type ResizablePanelProviderProps = {
	minHeight?: number;
	maxHeight?: number;
	defaultHeight?: number;
	children: React.ReactNode;
};

function useResizablePanel() {
	const context = useContext(ResizablePanelContext);

	if (!context) {
		throw Error(
			"You need to be inside the ResizablePanel component to use the useResizablePanel hook.",
		);
	}

	return context;
}

function ResizablePanelProvider(props: ResizablePanelProviderProps) {
	const {
		minHeight = 300,
		maxHeight = 800,
		defaultHeight = 300,
		children,
	} = props;

	const [height, setHeight] = useState(defaultHeight);
	const [isDragging, setIsDragging] = useState(false);
	const handleRef = useRef<HTMLButtonElement>(null);
	const startYRef = useRef(0);
	const startHeightRef = useRef(0);

	const onMouseDown = useCallback(
		(e: React.MouseEvent) => {
			setIsDragging(true);
			startYRef.current = e.clientY;
			startHeightRef.current = height;
		},
		[height],
	);

	const onMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;

			const deltaY = startYRef.current - e.clientY;
			const newHeight = startHeightRef.current + deltaY;

			setHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
		},
		[isDragging, minHeight, maxHeight],
	);

	const onMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);

			return () => {
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};
		}
	}, [isDragging, onMouseMove, onMouseUp]);

	return (
		<ResizablePanelContext.Provider
			value={{
				height,
				isDragging,
				handleRef,
				setHeight,
				onMouseDown,
			}}
		>
			{children}
		</ResizablePanelContext.Provider>
	);
}

function Container(props: React.PropsWithChildren) {
	const { height } = useResizablePanel();

	return (
		<div
			className="z-10 base-1 flex flex-col border-t border-ring-inner bg-background-default relative"
			style={{ height: `${height}px` }}
			{...props}
		/>
	);
}

function Handle(props: React.PropsWithChildren) {
	const { handleRef, onMouseDown, isDragging } = useResizablePanel();

	return (
		<button
			ref={handleRef}
			onMouseDown={onMouseDown}
			type="button"
			aria-label="Resize panel"
			className={cn(
				"h-15.5 absolute z-10 -top-7.5 left-0 right-0 cursor-grab! bg-transparent hover:bg-background-support/80 transition-colors w-full border-none p-0 grid place-items-center",
				isDragging && "cursor-grabbing! bg-background-support/60",
			)}
			{...props}
		/>
	);
}

const HandleIndicator = twx.div`bg-background-support h-2 w-32 rounded-md`;

const Content = twx.div`flex flex-col flex-1 overflow-hidden relative p-lg`;

export const ResizablePanel = {
	Provider: ResizablePanelProvider,
	Container,
	Handle,
	HandleIndicator,
	Content,
	useResizablePanel,
};
