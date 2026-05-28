import { useMutation } from "@tanstack/react-query";
import { useSelector } from "@tanstack/react-store";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { Node } from "@xyflow/react";
import { Play, X } from "lucide-react";
import { Activity, useCallback, useEffect, useMemo, useState } from "react";
import { Clickable } from "#/components/ui/clickable";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { ResizablePanel } from "#/components/ui/resizable-panel";
import { Table } from "#/components/ui/table";
import { events } from "#/events";
import { PipelineEvents } from "../../events";
import { createRunMutationOptions } from "../../lib/react-query/create-run-mutation-options";
import { usePipelineContext } from "../../store";

type OperationNodeData = {
	props: {
		operation: "sum" | "subtract" | "divide" | "multiply";
		by: number;
	};
};

const columns: ColumnDef<Node<OperationNodeData>>[] = [
	{
		id: "operation",
		header: "Operation",
		accessorFn: (row) => row.data?.props.operation,
	},
	{
		id: "by",
		header: "By",
		accessorFn: (row) => row.data?.props.by,
	},
];

function isOperationNode(node: Node): node is Node<OperationNodeData> {
	return node.type === "operation";
}

export function RunPanel() {
	const { store } = usePipelineContext();
	const createRunMutation = useMutation(createRunMutationOptions());

	const pipelineId = useSelector(store, (state) => state.id);
	const nodes = useSelector(store, (state) => state.nodes);

	const [isOpen, setIsOpen] = useState(false);
	const [payload, setPayload] = useState(0);

	const tableData = useMemo(() => nodes.filter(isOperationNode), [nodes]);

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

	const handleCreateRun = useCallback(() => {
		if (pipelineId === "new") return;

		createRunMutation.mutate({ pipelineId, payload });
	}, [pipelineId, payload, createRunMutation]);

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
							<div className="p-xs border border-ring-inner rounded-md">
								<Clickable.Button
									tone="success"
									variant="ghost"
									size="icon"
									onClick={handleCreateRun}
								>
									<Play size={16} />
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
