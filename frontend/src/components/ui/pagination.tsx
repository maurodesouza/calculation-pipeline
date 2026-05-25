import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { createContext, useContext } from "react";

import { twx } from "#/utils/tailwind";
import { Clickable } from "./clickable";
import { Text } from "./text";

type PaginationContextValue = {
	curPage: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
};

const PaginationContext = createContext<PaginationContextValue | null>(null);

function usePaginationContext() {
	const context = useContext(PaginationContext);

	if (!context)
		throw new Error("usePaginationContext must be used within Pagination.Root");

	return context;
}

type RootProps = {
	curPage: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
	children: React.ReactNode;
};

function Root(props: RootProps) {
	const { children, ...paginationValue } = props;
	return (
		<PaginationContext.Provider value={paginationValue}>
			{children}
		</PaginationContext.Provider>
	);
}

const Container = twx.div`flex items-center justify-between gap-md`;

function Info() {
	const { curPage, pageSize, total } = usePaginationContext();

	return (
		<div className="text-sm text-foreground">
			Showing {(curPage - 1) * pageSize + 1} to{" "}
			{Math.min(curPage * pageSize, total)} of {total} results
		</div>
	);
}

const Controls = twx.div`flex items-center gap-xs`;

const PageButton = twx(Clickable.Button)`size-8`;

function FirstPageButton(props: React.ComponentProps<typeof PageButton>) {
	const { curPage, onPageChange } = usePaginationContext();
	return (
		<PageButton
			onClick={() => onPageChange(1)}
			disabled={curPage === 1}
			variant="ghost"
			size="icon"
			{...props}
		>
			<ChevronsLeft size={16} />
		</PageButton>
	);
}

function PreviousPageButton(props: React.ComponentProps<typeof PageButton>) {
	const { curPage, onPageChange } = usePaginationContext();
	return (
		<PageButton
			onClick={() => onPageChange(Math.max(1, curPage - 1))}
			disabled={curPage === 1}
			variant="ghost"
			size="icon"
			{...props}
		>
			<ChevronLeft size={16} />
		</PageButton>
	);
}

function NextPageButton(props: React.ComponentProps<typeof PageButton>) {
	const { curPage, pageSize, total, onPageChange } = usePaginationContext();
	const pageCount = Math.ceil(total / pageSize);
	return (
		<PageButton
			onClick={() => onPageChange(Math.min(pageCount, curPage + 1))}
			disabled={curPage >= pageCount}
			variant="ghost"
			size="icon"
			{...props}
		>
			<ChevronRight size={16} />
		</PageButton>
	);
}

function LastPageButton(props: React.ComponentProps<typeof PageButton>) {
	const { curPage, pageSize, total, onPageChange } = usePaginationContext();
	const pageCount = Math.ceil(total / pageSize);
	return (
		<PageButton
			onClick={() => onPageChange(pageCount)}
			disabled={curPage >= pageCount}
			variant="ghost"
			size="icon"
			{...props}
		>
			<ChevronsRight size={16} />
		</PageButton>
	);
}

function PageInfo() {
	const { curPage, pageSize, total } = usePaginationContext();
	const pageCount = Math.ceil(total / pageSize);

	return (
		<Text.Paragraph className="text-sm text-foreground">
			Page {curPage} of {pageCount}
		</Text.Paragraph>
	);
}

export const Pagination = {
	Root,
	Container,
	Info,
	Controls,
	Buttons: {
		PageButton,
		First: FirstPageButton,
		Previous: PreviousPageButton,
		Next: NextPageButton,
		Last: LastPageButton,
	},
	PageInfo,
};
