"use client";

import { Button } from "@voltaze/ui/components/button";
import { Input } from "@voltaze/ui/components/input";
import { cn } from "@voltaze/ui/lib/utils";
import { ArrowLeft, Ticket, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	useCreateTicketTier,
	useDeleteTicketTier,
	useTicketTiers,
} from "@/lib/api/hooks";

export default function TicketManagementPage() {
	const params = useParams();
	const eventId = params.id as string;
	const [modalOpen, setModalOpen] = useState(false);
	const [newTier, setNewTier] = useState({ name: "", price: "", quantity: "" });

	const { data: tiers, isLoading } = useTicketTiers(eventId);
	const { mutate: createTier, isLoading: isCreating } = useCreateTicketTier();
	const { mutate: deleteTier, isLoading: isDeleting } = useDeleteTicketTier();

	const handleCreateTier = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createTier(eventId, {
				name: newTier.name,
				price: Number(newTier.price),
				quantity: Number(newTier.quantity),
			});
			toast.success("Tier created");
			setModalOpen(false);
			setNewTier({ name: "", price: "", quantity: "" });
			window.location.reload();
		} catch (error: unknown) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create tier",
			);
		}
	};

	const handleDelete = async (tierId: string) => {
		if (!confirm("Delete this tier?")) return;
		try {
			await deleteTier(tierId);
			toast.success("Deleted");
			window.location.reload();
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Failed to delete");
		}
	};

	return (
		<div className="space-y-12">
			<div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<Link
						href="/dashboard"
						className="label-sm mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
					>
						<ArrowLeft className="h-4 w-4" /> Dashboard
					</Link>
					<p className="label-sm mb-4">Ticketing</p>
					<h1 className="headline-lg">Tiers</h1>
					<p className="body-md mt-4 max-w-lg text-muted-foreground">
						Price is in whole INR. Razorpay receives paise.
					</p>
				</div>
				<Button
					className="gradient-cta border-0"
					onClick={() => setModalOpen(true)}
				>
					New tier
				</Button>
			</div>

			{isLoading ? (
				<div className="h-2 w-32 animate-pulse bg-muted" />
			) : !tiers?.length ? (
				<div className="bg-muted px-8 py-14">
					<Ticket className="mb-4 h-10 w-10 text-muted-foreground" />
					<p className="font-heading font-semibold text-lg">No tiers</p>
					<Button className="mt-6" onClick={() => setModalOpen(true)}>
						Add tier
					</Button>
				</div>
			) : (
				<ul className="space-y-8">
					{tiers.map((tier) => (
						<li
							key={tier.id}
							className="flex flex-col gap-6 bg-card p-8 md:flex-row md:items-center md:justify-between"
						>
							<div>
								<h2 className="font-heading font-semibold text-xl">
									{tier.name}
								</h2>
								<p className="body-md mt-2 text-muted-foreground">
									₹{tier.price.toLocaleString()} · Sold {tier.sold}
									{tier.quantity != null ? ` / ${tier.quantity}` : " · ∞ cap"}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleDelete(tier.id)}
								disabled={isDeleting}
								className="text-destructive hover:bg-destructive/10"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</Button>
						</li>
					))}
				</ul>
			)}

			{modalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--foreground)_35%,transparent)] p-6 backdrop-blur-sm"
					role="dialog"
					aria-modal="true"
				>
					<div className="glow-float w-full max-w-md bg-card p-8">
						<h3 className="headline-lg mb-8">New tier</h3>
						<form onSubmit={handleCreateTier} className="space-y-8">
							<div>
								<label htmlFor="tier-name" className="label-sm mb-3 block">
									Name
								</label>
								<Input
									id="tier-name"
									value={newTier.name}
									onChange={(e) =>
										setNewTier({ ...newTier, name: e.target.value })
									}
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-6">
								<div>
									<label htmlFor="tier-price" className="label-sm mb-3 block">
										Price ₹
									</label>
									<Input
										id="tier-price"
										type="number"
										min={0}
										value={newTier.price}
										onChange={(e) =>
											setNewTier({ ...newTier, price: e.target.value })
										}
										required
									/>
								</div>
								<div>
									<label htmlFor="tier-qty" className="label-sm mb-3 block">
										Qty
									</label>
									<Input
										id="tier-qty"
										type="number"
										min={1}
										value={newTier.quantity}
										onChange={(e) =>
											setNewTier({ ...newTier, quantity: e.target.value })
										}
										required
									/>
								</div>
							</div>
							<div className="flex gap-4 pt-4">
								<Button
									type="button"
									variant="ghost"
									className="flex-1"
									onClick={() => setModalOpen(false)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className={cn("gradient-cta flex-1 border-0")}
									disabled={isCreating}
								>
									{isCreating ? "…" : "Create"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
