import { useSelector } from "@tanstack/react-store";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Check, CircleDashed, Loader, Play, Trash2, X } from "lucide-react";
import { Activity, useCallback, useEffect, useMemo, useState } from "react";
import { Clickable } from "#/components/ui/clickable";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { ResizablePanel } from "#/components/ui/resizable-panel";
import { Table } from "#/components/ui/table";
import { events } from "#/events/index";
import { useTransition } from "#/hooks/use-transition";
import { PipelineEvents } from "../../events";
import { usePipelineContext } from "../../store";
import type { CanvasOperationNode } from "../../types/canvas-node";
import { canvas } from "../../utils/canvas";

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

	const isCreating = useTransition(["creating-run"]);

	const [isOpen, setIsOpen] = useState(false);
	const [payload, setPayload] = useState(0);

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

	async function onCreateRun() {
		events
			.sequence(undefined, {
				transition: ["creating-run"],
			})
			.step(() => events.pipelines.save())
			.step(([{ pipelineId }]) =>
				events.pipelines.run.create({ pipelineId, payload }),
			)
			.run();
	}

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
							<div className="p-xs border border-ring-inner rounded-md flex flex-col gap-xs">
								<Clickable.Button
									tone="success"
									variant="ghost"
									size="icon"
									onClick={onCreateRun}
									disabled={isCreating}
								>
									{isCreating ? (
										<Loader size={16} className="animate-spin" />
									) : (
										<Play size={16} />
									)}
								</Clickable.Button>

								<Clickable.Button
									tone="danger"
									variant="ghost"
									size="icon"
									onClick={() => events.emit(PipelineEvents.EXECUTION_CLEAR)}
									title="Clear execution history"
								>
									<Trash2 size={16} />
								</Clickable.Button>
							</div>

							<div className="flex-1">
								<Field.Root className="mb-md">
									<Field.Label htmlFor="payload-input">Payload:</Field.Label>
									<Input
										id="payload-input"
										type="number"
										value={payload}
										onChange={(e) => setPayload(Number(e.target.value))}
										className="w-32"
									/>
								</Field.Root>

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
