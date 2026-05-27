import { useCallback, useEffect, useState } from "react";
import { ResizablePanel } from "#/components/ui/resizable-panel";
import { events } from "#/events";
import { PipelineEvents } from "../../events";

export function RunPanel() {
	const [isOpen, setIsOpen] = useState(false);

	const onOpenPanel = useCallback(() => {
		setIsOpen(true);
	}, []);

	const onClosePanel = useCallback(() => {
		setIsOpen(false);
	}, []);

	useEffect(() => {
		const unsubscribeOpen = events.on(
			PipelineEvents.RUN_PANEL_OPEN,
			onOpenPanel,
		);
		const unsubscribeClose = events.on(
			PipelineEvents.RUN_PANEL_CLOSE,
			onClosePanel,
		);

		return () => {
			unsubscribeOpen();
			unsubscribeClose();
		};
	}, [onOpenPanel, onClosePanel]);

	if (!isOpen) return null;

	return (
		<ResizablePanel.Provider
			minHeight={230}
			maxHeight={800}
			defaultHeight={230}
		>
			<ResizablePanel.Container>
				<ResizablePanel.Handle>
					<ResizablePanel.HandleIndicator />
				</ResizablePanel.Handle>
				<ResizablePanel.Content />
			</ResizablePanel.Container>
		</ResizablePanel.Provider>
	);
}
