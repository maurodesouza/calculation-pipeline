import { useSelector } from "@tanstack/react-store";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Check, CircleDashed, Loader, X } from "lucide-react";
import { useMemo } from "react";
import { Table } from "#/components/ui/table";
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

			const { state } = execution;

			if (state === "pending")
				return <CircleDashed size={16} className="opacity-50" />;
			if (state === "running")
				return <Loader size={16} className="animate-spin" />;
			if (state === "completed")
				return <Check size={16} className="text-success" />;
			if (state === "failed") return <X size={16} className="text-error" />;
			return null;
		},
	},
	{
		id: "result",
		header: "Result",
		cell: ({ row }) => {
			const execution = row.original.data.execution;
			if (!execution) return null;

			const { state, result, error } = execution;

			if (state === "completed") return result;
			if (state === "failed") return error;
			return null;
		},
	},
];

export function RunTable() {
	const { store } = usePipelineContext();
	const nodes = useSelector(store, (state) => state.nodes);
	const edges = useSelector(store, (state) => state.edges);

	const tableData = useMemo(() => {
		return canvas.chain.build(nodes, edges);
	}, [nodes, edges]);

	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Table.Root table={table}>
			<Table.Header>
				<Table.HeaderGroups
					render={(headerGroup) => (
						<Table.HeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
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
	);
}
