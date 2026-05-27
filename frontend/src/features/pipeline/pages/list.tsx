import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Pagination } from "#/components/ui/pagination";
import { Table } from "#/components/ui/table";
import { Text } from "#/components/ui/text";
import { Route as RootRoute } from "#/routes/__root";
import { getPipelinesQueryOptions } from "../lib/react-query/get-pipelines-query-options";

type Pipeline = {
	id: string;
	name?: string;
	description?: string;
	initialStepId?: string;
	createdAt: Date;
	updatedAt: Date;
};

export const PipelineListRoute = createRoute({
	getParentRoute: () => RootRoute,
	path: "/pipelines/",
	component: PipelineList,
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(
			getPipelinesQueryOptions({ page: 1, limit: 10 }),
		);
	},
});

function PipelineList() {
	const [curPage, setCurPage] = useState(1);
	const pageSize = 10;

	const pipelineQuery = useSuspenseQuery(
		getPipelinesQueryOptions({ page: curPage, limit: pageSize }),
	);

	const columns: ColumnDef<Pipeline>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => row.original.name || "Unnamed",
		},
		{
			accessorKey: "description",
			header: "Description",
		},
		{
			accessorKey: "createdAt",
			header: "Created At",
			cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
		},
		{
			accessorKey: "updatedAt",
			header: "Updated At",
			cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
		},
	];

	const table = useReactTable({
		data: pipelineQuery.data.data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	function onPageChange(page: number) {
		setCurPage(page);
	}

	return (
		<div className="p-md">
			<Text.Heading hierarchy="h1">Pipelines</Text.Heading>

			<div className="mt-md">
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

									<Table.RowLink to={`/pipelines/${row.original.id}`} />
								</Table.Row>
							)}
						/>
					</Table.Body>
				</Table.Root>

				<div className="mt-md">
					<Pagination.Root
						curPage={curPage}
						pageSize={pageSize}
						total={pipelineQuery.data.total}
						onPageChange={onPageChange}
					>
						<Pagination.Container>
							<Pagination.Info />
							<Pagination.Controls>
								<Pagination.Buttons.First />
								<Pagination.Buttons.Previous />
								<Pagination.PageInfo />
								<Pagination.Buttons.Next />
								<Pagination.Buttons.Last />
							</Pagination.Controls>
						</Pagination.Container>
					</Pagination.Root>
				</div>
			</div>
		</div>
	);
}
