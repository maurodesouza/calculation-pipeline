import { useSelector } from "@tanstack/react-store";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Check, CircleDashed, Loader, X } from "lucide-react";
import { Activity, useCallback, useEffect, useMemo, useState } from "react";
import { Clickable } from "#/components/ui/clickable";
import { ResizablePanel } from "#/components/ui/resizable-panel";
import { Table } from "#/components/ui/table";
import { events } from "#/events/index";
import { PipelineEvents } from "../../events";
import { usePipelineContext } from "../../store";
import type { CanvasOperationNode } from "../../types/canvas-node";
import { canvas } from "../../utils/canvas";
import { Controls } from "./controls";

const columns: ColumnDef<CanvasOperationNode>[] = [
	{
		id: "operation",
		header: "Operation",
		accessorFn: (row) => row.data.props.operation,
	},
	{
		id: "by",
		header: "By",
		accessorFn: (row) => row.data.props.by,
	},
	{
		id: "status",
		header: "Status",
		cell: ({ row }) => {
			const execution = row.original.data.execution;
			if (!execution) return null;

			const { state, result, error } = execution;

			if (state === "pending")
				return <CircleDashed size={16} className="opacity-50" />;
			if (state === "running")
				return <Loader size={16} className="animate-spin" />;
			if (state === "completed")
				return (
					<span className="flex items-center gap-xs">
						<Check size={16} className="text-success" />
						{result}
					</span>
				);
			if (state === "failed")
				return (
					<span className="flex items-center gap-xs">
						<X size={16} className="text-error" />
						{error}
					</span>
				);
			return null;
		},
	},
];

export function RunPanel() {
	const { store } = usePipelineContext();

	const nodes = useSelector(store, (state) => state.nodes);
	const edges = useSelector(store, (state) => state.edges);

	const [isOpen, setIsOpen] = useState(false);

	const tableData = useMemo(() => {
		return canvas.chain.build(nodes, edges);
	}, [nodes, edges]);

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

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
				minHeight={230}
				maxHeight={800}
				defaultHeight={230}
			>
				<ResizablePanel.Container>
					<ResizablePanel.Handle />
					<ResizablePanel.Content>
						<ResizablePanel.HandleIndicator className="self-center" />
						<Clickable.Button
							variant="icon"
							size="icon"
							onClick={() => events.emit(PipelineEvents.RUN_PANEL_CLOSE)}
							className="absolute top-2 right-2 z-20"
						>
							<X size={16} />
						</Clickable.Button>

						<div className="flex gap-md">
							<Controls.Container>
								<Controls.Play />
								<Controls.Toggle />
								<Controls.Finalize />
								<Controls.Clear />
							</Controls.Container>

							<div className="flex-1">
								<Controls.PayloadInput />

								<Table.Root table={table}>
									<Table.Header>
										<Table.HeaderGroups
											render={(headerGroup) => (
												<Table.HeaderGroup
													key={headerGroup.id}
													headerGroup={headerGroup}
												>
													<Table.HeaderCells
														render={({ header, render }) => (
															<Table.HeaderCell key={header.id}>
																{header.isPlaceholder ? null : render}
															</Table.HeaderCell>
														)}
													/>
												</Table.HeaderGroup>
											)}
										/>
									</Table.Header>
									<Table.Body>
										<Table.Rows
											render={(row) => (
												<Table.Row key={row.id} row={row}>
													<Table.Cells
														render={({ cell, render }) => (
															<Table.Cell key={cell.id}>{render}</Table.Cell>
														)}
													/>
												</Table.Row>
											)}
										/>
									</Table.Body>
								</Table.Root>
							</div>
						</div>
					</ResizablePanel.Content>
				</ResizablePanel.Container>
			</ResizablePanel.Provider>
		</Activity>
	);
}
