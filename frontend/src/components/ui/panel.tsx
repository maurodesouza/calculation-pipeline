import { ChevronLeft } from "lucide-react";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { events } from "#/events";
import type { Renderable } from "#/types/renderable";
import { cn, twx } from "#/utils/tailwind";
import { FlexibleRender } from "../helpers/flexible-render";

type PanelContextState = {
	isOpen: boolean;
	panel?: React.ReactNode;
	context?: string;
};

const PanelContext = createContext<PanelContextState>({} as PanelContextState);

type PanelProviderProps = {
	initialPanel?: React.ReactNode;
	context?: string;
};

function usePanel() {
	const context = useContext(PanelContext);

	if (!context)
		throw Error(
			"You need to be inside the PanelContext component to use the usePanel hook.",
		);

	return context;
}

function PanelProvider(props: React.PropsWithChildren<PanelProviderProps>) {
	const [isOpen, setIsOpen] = useState(false);
	const [panel, setPanel] = useState<React.ReactNode | undefined>(
		props.initialPanel,
	);

	const onShowPanel = useCallback((panel: Renderable) => {
		setPanel(panel);
		setIsOpen(true);
	}, []);

	const onClearPanel = useCallback(() => {
		setPanel(undefined);
	}, []);

	const onOpenPanel = useCallback(() => {
		setIsOpen(true);
	}, []);

	const onClosePanel = useCallback(() => {
		setIsOpen(false);
	}, []);

	useEffect(() => {
		const prefix = props.context ? `${props.context}.` : "";

		const unsubscribeShow = events.on(`${prefix}panel.show`, onShowPanel);
		const unsubscribeClear = events.on(`${prefix}panel.clear`, onClearPanel);
		const unsubscribeOpen = events.on(`${prefix}panel.open`, onOpenPanel);
		const unsubscribeClose = events.on(`${prefix}panel.close`, onClosePanel);

		return () => {
			unsubscribeShow();
			unsubscribeClear();
			unsubscribeOpen();
			unsubscribeClose();
		};
	}, [props.context, onShowPanel, onClearPanel, onOpenPanel, onClosePanel]);

	return (
		<PanelContext.Provider
			value={{
				panel,
				context: props.context,
				isOpen,
			}}
			{...props}
		/>
	);
}

function PanelContainer(props: React.PropsWithChildren) {
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<div
			className={cn(
				"w-0 max-w-0 h-full relative laptop:w-full laptop:max-w-panel",
			)}
			ref={containerRef}
			{...props}
		/>
	);
}

function PanelWrapper(props: React.PropsWithChildren) {
	const { isOpen } = usePanel();

	return (
		<div
			className={cn(
				`absolute top-0 w-panel h-full bg-background-default border-r border-ring-inner z-10 laptop:shadow-none`,
				"left-0",
				isOpen
					? `shadow-panel-left`
					: "max-laptop:border-none max-laptop:-z-10 max-laptop:shadow-none",
			)}
			{...props}
		/>
	);
}

function PanelContent(props: React.PropsWithChildren) {
	const { isOpen } = usePanel();

	return (
		<div
			className={cn(
				"w-full h-full flex flex-col",
				!isOpen && "max-laptop:opacity-0 max-laptop:overflow-hidden",
			)}
			{...props}
		/>
	);
}

const Scrollable = twx.div`h-full w-[calc(100%+(var(--spacing-md)*2))] -ml-md pl-md pr-xs overflow-y-scroll scrollbar`;

function PanelRender() {
	const { panel: Panel } = usePanel();

	if (!Panel) return null;

	return <FlexibleRender render={Panel} />;
}

function PanelToggle() {
	const { isOpen, context } = usePanel();

	function togglePanel() {
		const method = isOpen ? "close" : "open";
		const eventName = context
			? `${context}.panel.${method}`
			: `panel.${method}`;

		events.emit(eventName);
	}

	function getBorderClasses() {
		return "pr-0 border-r-0! rounded-tr-none! rounded-br-none!";
	}

	function getPositionClasses() {
		if (isOpen) return "-right-panel";

		return "-right-1.25";
	}

	return (
		<button
			type="button"
			onClick={togglePanel}
			aria-label="Toggle left panel"
			style={{
				transform: isOpen ? `translateX(70%)` : "rotate(180deg)",
			}}
			className={cn(
				"absolute grid place-items-center top-md bg-background-default! box-border rounded-md p-[calc(var(--spacing-xs)/2)] z-20 laptop:hidden",

				getPositionClasses(),
				!isOpen && getBorderClasses(),
			)}
		>
			<ChevronLeft size={24} className="cursor-pointer!" />
		</button>
	);
}

type FullPanelTemplateProps = PanelProviderProps;

function FullPanelTemplate(props: FullPanelTemplateProps) {
	return (
		<PanelProvider {...props}>
			<PanelContainer>
				<PanelToggle />

				<PanelWrapper>
					<PanelContent>
						<PanelRender />
					</PanelContent>
				</PanelWrapper>
			</PanelContainer>
		</PanelProvider>
	);
}

const Header = twx.div`flex gap-md items-center p-md border-b border-ring-inner`;
const Body = twx.div`p-md w-full h-full`;
const Footer = twx.div`p-md flex flex-col gap-md w-full border-t border-ring-inner`;

export const Panel = {
	Template: {
		Full: FullPanelTemplate,
	},

	Provider: PanelProvider,

	Container: PanelContainer,
	Wrapper: PanelWrapper,
	Content: PanelContent,

	Header,
	Body,
	Footer,
	Scrollable,

	Render: PanelRender,
	Toggle: PanelToggle,
};
