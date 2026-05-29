import { X } from "lucide-react";
import { Activity, useCallback, useEffect, useState } from "react";
import { Clickable } from "#/components/ui/clickable";
import { ResizablePanel } from "#/components/ui/resizable-panel";
import { events } from "#/events/index";
import { PipelineEvents } from "../../events";
import { Controls } from "./controls";
import { RunTable } from "./table";

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

	return (
		<Activity mode={isOpen ? "visible" : "hidden"}>
			<ResizablePanel.Provider
				minHeight={240}
				maxHeight={800}
				defaultHeight={230}
			>
				<ResizablePanel.Container>
					<ResizablePanel.Handle />

					<ResizablePanel.Content>
						<Clickable.Button
							variant="icon"
							size="icon"
							onClick={() => events.emit(PipelineEvents.RUN_PANEL_CLOSE)}
							className="absolute top-2 right-2 z-20"
						>
							<X size={16} />
						</Clickable.Button>

						<ResizablePanel.HandleIndicator className="self-center" />

						<div className="flex gap-md h-full min-h-0">
							<Controls.Container>
								<Controls.Play />
								<Controls.Toggle />
								<Controls.Finalize />
								<Controls.Clear />
							</Controls.Container>

							<div className="flex flex-col gap-md h-full w-full">
								<Controls.PayloadInput />

								<div className="scrollbar overflow-y-scroll">
									<RunTable />
								</div>
							</div>
						</div>
					</ResizablePanel.Content>
				</ResizablePanel.Container>
			</ResizablePanel.Provider>
		</Activity>
	);
}
