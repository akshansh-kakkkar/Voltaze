"use client";

import { useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { useEventTicketTiers, useCreateEventTicketTier } from "../hooks/use-events";
import { Button } from "@/shared/ui/button";

export function ManageTiersPanel({ eventId, eventUserId }: { eventId: string; eventUserId: string }) {
	const { user } = useAuth();
	const tiersQuery = useEventTicketTiers(eventId);
	const createTierEntry = useCreateEventTicketTier(eventId);

	const [isAdding, setIsAdding] = useState(false);
	const [name, setName] = useState("");
	const [price, setPrice] = useState(0);
	const [maxQuantity, setMaxQuantity] = useState(100);

	if (!user || user.id !== eventUserId) {
		return null; // Only the host can manage tiers
	}

	const handleAddTier = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createTierEntry.mutateAsync({
				name,
				price,
				maxQuantity,
				maxQuantityPerOrder: 5,
			});
			setIsAdding(false);
			setName("");
			setPrice(0);
			setMaxQuantity(100);
		} catch (err: any) {
			alert("Failed to create tier: " + err.message);
		}
	};

	return (
		<div className="panel mt-8 p-6 md:p-8 space-y-6 border-t-4 border-indigo-500">
			<div>
				<h3 className="text-xl font-bold text-[#0e1838]">Host Controls: Manage Tiers</h3>
				<p className="text-sm text-[#5f6984] mt-1">Configure standard tickets, VIP passes, and pricing bounds.</p>
			</div>

			{tiersQuery.isLoading ? (
				<div className="text-sm text-[#5f6984]">Loading tiers...</div>
			) : (
				<div className="space-y-4">
					{tiersQuery.data?.data.map((tier) => (
						<div key={tier.id} className="flex justify-between items-center rounded-xl bg-white border p-4 shadow-sm">
							<div>
								<span className="font-bold text-[#0e1838]">{tier.name}</span>
								<div className="text-sm text-[#5f6984] mt-1">Price: ₹{tier.price} • Capacity: {tier.maxQuantity}</div>
							</div>
							<span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">Active</span>
						</div>
					))}
					
					{tiersQuery.data?.data.length === 0 && (
						<div className="text-sm italic text-[#5f6984]">No ticket tiers exist yet. Users cannot checkout until you create one!</div>
					)}
				</div>
			)}

			{!isAdding ? (
				<Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">+ Create Ticket Tier</Button>
			) : (
				<form onSubmit={handleAddTier} className="p-4 bg-[#f8fbff] rounded-xl border border-indigo-100 space-y-4">
					<div>
						<label className="text-xs font-bold text-[#5f6984] uppercase">Tier Name (e.g. VIP, Standard)</label>
						<input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 h-10 px-3 border rounded-lg outline-none" />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-xs font-bold text-[#5f6984] uppercase">Price (₹)</label>
							<input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} required className="w-full mt-1 h-10 px-3 border rounded-lg outline-none" />
						</div>
						<div>
							<label className="text-xs font-bold text-[#5f6984] uppercase">Total Capacity</label>
							<input type="number" value={maxQuantity} onChange={(e) => setMaxQuantity(Number(e.target.value))} min={1} required className="w-full mt-1 h-10 px-3 border rounded-lg outline-none" />
						</div>
					</div>
					<div className="flex gap-3">
						<Button type="submit" disabled={createTierEntry.isPending}>Save Tier</Button>
						<Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
					</div>
				</form>
			)}
		</div>
	);
}
