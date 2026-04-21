"use client";

import type { PaginationMeta } from "@unievent/schema";
import { Button } from "./button";

interface Column<T> {
	header: string;
	accessorKey?: keyof T;
	cell?: (row: T) => React.ReactNode;
	className?: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	meta?: PaginationMeta;
	onPageChange?: (page: number) => void;
	onRowClick?: (row: T) => void;
	keyExtractor: (row: T) => string;
}

export function DataTable<T>({
	columns,
	data,
	meta,
	onPageChange,
	onRowClick,
	keyExtractor,
}: DataTableProps<T>) {
	return (
		<div className="space-y-4">
			<div className="overflow-x-auto rounded-xl border border-[#d6def4]">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-[#d6def4] border-b bg-[#f4f7ff]">
							{columns.map((col) => (
								<th
									key={col.header}
									className="px-4 py-3 font-semibold text-[#5f6984] text-xs uppercase tracking-wide"
								>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-4 py-8 text-center text-[#5f6984]"
								>
									No records found
								</td>
							</tr>
						) : (
							data.map((row) => (
								<tr
									key={keyExtractor(row)}
									onClick={() => onRowClick?.(row)}
									className={`border-[#e8edf8] border-b bg-white transition-colors last:border-b-0 ${
										onRowClick
											? "cursor-pointer hover:bg-[#f8faff]"
											: ""
									}`}
								>
									{columns.map((col) => (
										<td
											key={col.header}
											className={`px-4 py-3 text-[#1e2a4d] ${col.className ?? ""}`}
										>
											{col.cell
												? col.cell(row)
												: col.accessorKey
													? String(
															(row as Record<string, unknown>)[
																col.accessorKey as string
															] ?? "",
														)
													: null}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{meta && meta.totalPages > 1 && (
				<div className="flex items-center justify-between gap-3">
					<p className="text-[#5f6984] text-sm">
						Page {meta.page} of {meta.totalPages} · {meta.total} total
					</p>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							disabled={!meta.hasPreviousPage}
							onClick={() => onPageChange?.(meta.page - 1)}
						>
							Previous
						</Button>
						<Button
							variant="ghost"
							size="sm"
							disabled={!meta.hasNextPage}
							onClick={() => onPageChange?.(meta.page + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
