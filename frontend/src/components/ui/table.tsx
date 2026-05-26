import { Link } from "@tanstack/react-router";
import {
	type Cell as CellType,
	flexRender,
	type HeaderGroup as HeaderGroupType,
	type Header as HeaderType,
	type Row as RowType,
	type Table as TableType,
} from "@tanstack/react-table";
import type React from "react";
import { createContext, useContext } from "react";
import { twx } from "#/utils/tailwind";

type TableContextValue<TData> = {
	table: TableType<TData>;
};

const TableContext = createContext<TableContextValue<any> | null>(null);

function useTableContext<TData>() {
	const context = useContext(TableContext);

	if (!context)
		throw new Error("useTableContext must be used within Table.Root");

	return context as TableContextValue<TData>;
}

type HeaderGroupContextValue<TData> = {
	headerGroup: HeaderGroupType<TData>;
};

const HeaderGroupContext = createContext<HeaderGroupContextValue<any> | null>(
	null,
);

function useHeaderGroupContext<TData>() {
	const context = useContext(HeaderGroupContext);

	if (!context)
		throw new Error(
			"useHeaderGroupContext must be used within Table.HeaderGroup",
		);

	return context as HeaderGroupContextValue<TData>;
}

type RowContextValue<TData> = {
	row: RowType<TData>;
};

const RowContext = createContext<RowContextValue<any> | null>(null);

function useRowContext<TData>() {
	const context = useContext(RowContext);

	if (!context) throw new Error("useRowContext must be used within Table.Row");

	return context as RowContextValue<TData>;
}

type RootProps<TData> = React.ComponentPropsWithoutRef<"table"> & {
	table: TableType<TData>;
};

function Root<TData>(props: RootProps<TData>) {
	const { table, ...rest } = props;

	return (
		<TableContext.Provider value={{ table }}>
			<table className="w-full border-collapse" {...rest} />
		</TableContext.Provider>
	);
}

const Header = twx.thead`bg-background-support`;

type HeaderGroupsProps = {
	render: <T>(headerGroup: HeaderGroupType<T>) => React.ReactNode;
};

function HeaderGroups<T>(props: HeaderGroupsProps) {
	const { table } = useTableContext<T>();
	return <>{table.getHeaderGroups().map(props.render)}</>;
}

type HeaderGroupProps<TData> = React.ComponentPropsWithoutRef<"tr"> & {
	headerGroup: HeaderGroupType<TData>;
	children: React.ReactNode;
};

function HeaderGroup<TData>(props: HeaderGroupProps<TData>) {
	const { headerGroup, children, ...rest } = props;
	return (
		<HeaderGroupContext.Provider value={{ headerGroup }}>
			<tr className="border-b" {...rest}>
				{children}
			</tr>
		</HeaderGroupContext.Provider>
	);
}

type HeaderCellsProps = {
	render: (header: {
		header: HeaderType<any, any>;
		render: React.ReactNode;
	}) => React.ReactNode;
};

function HeaderCells(props: HeaderCellsProps) {
	const { headerGroup } = useHeaderGroupContext();
	return (
		<>
			{headerGroup.headers.map((header) => {
				const render = flexRender(
					header.column.columnDef.header,
					header.getContext(),
				);

				return props.render({ render, header });
			})}
		</>
	);
}

const HeaderCell = twx.th`px-md py-xs text-left text-sm font-semibold text-foreground`;

const Body = twx.tbody`divide-y divide-border`;

type RowsProps = {
	render: (row: RowType<any>) => React.ReactNode;
};

function Rows(props: RowsProps) {
	const { table } = useTableContext();

	if (table.getFilteredRowModel().rows.length === 0) {
		return null;
	}

	return <>{table.getRowModel().rows.map(props.render)}</>;
}

type RowProps<TData> = React.ComponentPropsWithoutRef<"tr"> & {
	row: RowType<TData>;
	children: React.ReactNode;
};

function Row<TData>(props: RowProps<TData>) {
	const { row, ...rest } = props;
	return (
		<RowContext.Provider value={{ row }}>
			<tr
				className="hover:bg-background-support transition-colors relative"
				{...rest}
			/>
		</RowContext.Provider>
	);
}

type CellsProps = {
	render: (cell: {
		cell: CellType<any, any>;
		render: React.ReactNode;
	}) => React.ReactNode;
};

function Cells(props: CellsProps) {
	const { row } = useRowContext();
	return (
		<>
			{row.getVisibleCells().map((cell) => {
				const render = flexRender(
					cell.column.columnDef.cell,
					cell.getContext(),
				);

				return props.render({ render, cell });
			})}
		</>
	);
}

const Cell = twx.td`px-md py-xs text-sm text-foreground`;

const RowLink = twx(Link)`absolute inset-0 visibility-hidden`;

function Empty(props: React.PropsWithChildren) {
	const { table } = useTableContext();

	if (table.getFilteredRowModel().rows.length === 0) {
		return <>{props.children}</>;
	}

	return null;
}

export const Table = {
	Root,
	Header,
	HeaderGroups,
	HeaderGroup,
	HeaderCells,
	HeaderCell,
	Body,
	Rows,
	Row,
	Cells,
	Cell,
	RowLink,
	Empty,
};
