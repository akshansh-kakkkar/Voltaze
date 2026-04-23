"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowUpRight,
	Calendar,
	Check,
	Loader2,
	Search,
	ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/core/lib/cn";
import { useEvents } from "@/modules/events";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useOrders } from "../hooks/use-orders";
import type { OrderRecord } from "../services/orders.service";

const statusVariant: Record<
	string,
	"default" | "success" | "warning" | "destructive"
> = {
	PENDING: "warning",
	COMPLETED: "success",
	CANCELLED: "destructive",
};

export function OrdersView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<
		"PENDING" | "COMPLETED" | "CANCELLED" | ""
	>("");
	const [searchQuery, setSearchQuery] = useState("");

	const ordersQuery = useOrders({
		page,
		limit: 10,
		status: status || undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const eventsQuery = useEvents({ limit: 100 });
	const events = eventsQuery.data?.data ?? [];

	const eventMap = useMemo(() => {
		const map = new Map();
		for (const e of events) map.set(e.id, e);
		return map;
	}, [events]);

	const columns = useMemo<ColumnDef<OrderRecord>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Record Reference",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-100 bg-slate-50">
							<ShoppingBag size={16} className="text-slate-400" />
						</div>
						<div className="flex flex-col">
							<span className="font-black font-mono text-slate-900 text-xs tracking-tighter">
								ORD-{row.original.id.slice(-8).toUpperCase()}
							</span>
							<span className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
								Protocol Ledger
							</span>
						</div>
					</div>
				),
			},
			{
				accessorKey: "eventId",
				header: "Operational Asset",
				cell: ({ row }) => {
					const event = eventMap.get(row.original.eventId);
					return (
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-slate-50">
								{event?.thumbnail ? (
									<Image
										src={event.thumbnail}
										alt={event.name}
										width={40}
										height={40}
										className="h-full w-full object-cover"
									/>
								) : (
									<ShoppingBag className="text-slate-200" size={18} />
								)}
							</div>
							<div className="min-w-0 max-w-[200px]">
								<p className="truncate font-black text-slate-900 text-sm uppercase tracking-tight">
									{event?.name || "Loading..."}
								</p>
								<p className="truncate font-black text-[9px] text-slate-400 uppercase tracking-widest">
									Venue
								</p>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Operational Status",
				cell: ({ row }) => (
					<Badge
						variant={statusVariant[row.original.status] ?? "default"}
						className="rounded-none border-none px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] shadow-sm"
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Time Stamp",
				cell: ({ row }) => (
					<div className="flex items-center gap-2 text-slate-600">
						<Calendar size={14} className="opacity-30" />
						<div className="flex flex-col">
							<span className="font-black text-slate-900 text-xs uppercase tracking-tighter">
								{format(new Date(row.original.createdAt), "dd MMM yyyy")}
							</span>
							<span className="font-black text-[9px] text-slate-400 uppercase tracking-widest">
								{format(new Date(row.original.createdAt), "HH:mm")}
							</span>
						</div>
					</div>
				),
			},
			{
				id: "actions",
				header: "",
				cell: () => (
					<div className="flex justify-end">
						<Button
							variant="ghost"
							className="h-9 w-9 rounded-none border border-slate-100 bg-slate-50 p-0 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
						>
							<ArrowUpRight size={16} />
						</Button>
					</div>
				),
			},
		],
		[eventMap],
	);

	return (
		<div className="fade-in w-full min-w-0 animate-in space-y-1 overflow-hidden pb-20 duration-500">
			{/* Top Bar - Sharp Header */}
			<div className="flex w-full min-w-0 flex-col justify-between gap-6 border border-[#dbe7ff] bg-white p-4 sm:p-8 xl:flex-row xl:items-end">
				<div className="min-w-0 space-y-2 text-center sm:text-left">
					<span className="block font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">
						Operations Ledger
					</span>
					<h2 className="truncate font-black text-2xl text-[#071a78] uppercase tracking-tighter sm:text-3xl">
						My Orders
					</h2>
					<p className="max-w-xl font-bold text-slate-400 text-xs sm:text-sm">
						Track your ticket purchases, order status, and complete transaction
						history.
					</p>
				</div>

				<div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
					<div className="relative w-full md:w-72">
						<Search
							className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
							size={16}
						/>
						<Input
							placeholder="Reference lookup..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-10 w-full rounded-none border-[#dbe7ff] bg-white pl-11 font-black text-[10px] uppercase tracking-widest shadow-sm sm:h-12 sm:text-xs"
						/>
					</div>

					<div className="flex w-full items-center gap-3 border border-[#dbe7ff] bg-white p-1 shadow-sm md:w-auto">
						<Select
							value={status}
							onChange={(e) => {
								setStatus(
									e.target.value as "" | "PENDING" | "CANCELLED" | "COMPLETED",
								);
								setPage(1);
							}}
							className="h-8 min-w-[120px] rounded-none border-none bg-slate-50 font-black text-[9px] text-slate-500 uppercase tracking-widest sm:min-w-[140px] sm:text-[10px]"
						>
							<option value="">All Streams</option>
							<option value="PENDING">Pending</option>
							<option value="COMPLETED">Completed</option>
							<option value="CANCELLED">Cancelled</option>
						</Select>
					</div>
				</div>
			</div>

			{/* Quick Stats Matrix - Sharp */}
			<div className="grid w-full min-w-0 grid-cols-1 gap-2 md:grid-cols-3 md:gap-1">
				<QuickStat
					label="Total Orders"
					value={ordersQuery.data?.meta.total ?? 0}
					icon={<ShoppingBag size={20} />}
					accent="blue"
				/>
				<QuickStat
					label="Completed"
					value={
						ordersQuery.data?.data.filter(
							(o: OrderRecord) => o.status === "COMPLETED",
						).length ?? 0
					}
					icon={<Check size={20} />}
					accent="green"
				/>
				<QuickStat
					label="Processing"
					value={
						ordersQuery.data?.data.filter(
							(o: OrderRecord) => o.status === "PENDING",
						).length ?? 0
					}
					icon={<Loader2 size={20} className="animate-spin" />}
					accent="amber"
				/>
			</div>

			{/* Desktop Table View */}
			<div className="hidden w-full overflow-hidden border border-[#dbe7ff] bg-white shadow-sm md:block">
				<DataTable
					columns={columns}
					data={ordersQuery.data?.data ?? []}
					meta={ordersQuery.data?.meta}
					onPageChange={setPage}
					isLoading={ordersQuery.isLoading || eventsQuery.isLoading}
				/>
			</div>

			{/* Mobile Card View */}
			<div className="w-full min-w-0 space-y-2 md:hidden">
				{ordersQuery.isLoading ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="h-32 animate-pulse border border-[#dbe7ff] bg-white"
						/>
					))
				) : ordersQuery.data?.data.length === 0 ? (
					<div className="border border-[#dbe7ff] border-dashed bg-white py-12 text-center">
						<p className="px-4 font-black text-[9px] text-slate-400 uppercase tracking-widest">
							No records found in protocol
						</p>
					</div>
				) : (
					ordersQuery.data?.data.map((order: OrderRecord) => {
						const event = eventMap.get(order.eventId);
						return (
							<div
								key={order.id}
								className="space-y-4 border border-[#dbe7ff] bg-white p-4 shadow-sm transition-colors active:bg-slate-50"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-white">
											{event?.thumbnail ? (
												<Image
													src={event.thumbnail}
													alt=""
													width={40}
													height={40}
													className="h-full w-full object-cover"
												/>
											) : (
												<ShoppingBag size={14} className="text-slate-200" />
											)}
										</div>
										<div className="min-w-0">
											<p className="truncate font-black text-[11px] text-slate-900 uppercase tracking-tight sm:text-xs">
												{event?.name || "Unidentified Asset"}
											</p>
											<p className="mt-0.5 font-black font-mono text-[8px] text-slate-400 uppercase tracking-[0.2em]">
												ORD-{order.id.slice(-8).toUpperCase()}
											</p>
										</div>
									</div>
									<Badge
										variant={statusVariant[order.status] ?? "default"}
										className="shrink-0 border-none bg-slate-100 px-2 py-0.5 font-black text-[8px] uppercase tracking-widest"
									>
										{order.status}
									</Badge>
								</div>

								<div className="flex items-center justify-between border-slate-50 border-t pt-3">
									<div className="flex items-center gap-2 text-slate-400">
										<Calendar size={10} />
										<span className="font-black text-[8px] uppercase tracking-[0.2em]">
											{format(new Date(order.createdAt), "dd MMM yyyy")}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<button
											type="button"
											className="h-8 bg-[#030370] px-4 font-black text-[8px] text-white uppercase tracking-widest transition-all hover:bg-slate-900 active:scale-95"
										>
											View Protocol
										</button>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

function QuickStat({
	label,
	value,
	icon,
	accent,
}: {
	label: string;
	value: number | string;
	icon: React.ReactNode;
	accent: string;
}) {
	const accents: Record<string, string> = {
		blue: "bg-blue-50/50 text-blue-600 border-blue-100",
		green: "bg-emerald-50/50 text-emerald-600 border-emerald-100",
		amber: "bg-amber-50/50 text-amber-600 border-amber-100",
	};

	return (
		<div className="group flex w-full min-w-0 items-center justify-between border border-[#dbe7ff] bg-white p-4 transition-all hover:bg-slate-50 sm:p-6">
			<div className="min-w-0 flex-1">
				<p className="truncate font-black text-[9px] text-slate-400 uppercase tracking-[0.2em]">
					{label}
				</p>
				<p className="mt-1 truncate font-black text-slate-900 text-xl uppercase tracking-tighter sm:text-2xl">
					{value}
				</p>
			</div>
			<div
				className={cn(
					"flex h-10 w-10 shrink-0 items-center justify-center border shadow-inner transition-transform group-hover:scale-110 sm:h-12 sm:w-12",
					accents[accent],
				)}
			>
				{icon}
			</div>
		</div>
	);
}
