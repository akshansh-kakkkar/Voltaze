"use client";

import { Button } from "@voltaze/ui/components/button";
import { Input } from "@voltaze/ui/components/input";
import { cn } from "@voltaze/ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateEvent, useCreateOrg, useListOrgs } from "@/lib/api/hooks";

const textareaClass =
	"w-full min-h-[140px] resize-y border-0 border-b-2 border-[color-mix(in_srgb,var(--outline-variant)_40%,transparent)] bg-transparent py-2 text-sm outline-none focus:border-primary";

export default function CreateEventPage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: orgs, isLoading: isLoadingOrgs } = useListOrgs();
	const { mutate: createEvent } = useCreateEvent();
	const { mutate: createOrg } = useCreateOrg();
	const [newOrgName, setNewOrgName] = useState("");

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		startDate: "",
		endDate: "",
		location: "",
		description: "",
	});

	const handleCreateOrg = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newOrgName.trim()) return;
		try {
			setIsSubmitting(true);
			await createOrg({ name: newOrgName });
			toast.success("Organization created");
			window.location.reload();
		} catch (error: unknown) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create organization",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoadingOrgs) {
		return (
			<div className="flex h-48 items-center justify-center">
				<div className="h-2 w-24 animate-pulse bg-primary" />
			</div>
		);
	}

	if (!orgs?.length) {
		return (
			<div className="bg-muted px-8 py-12 md:px-10">
				<p className="label-sm mb-4">Organization</p>
				<h1 className="headline-lg mb-8">Name your host</h1>
				<form onSubmit={handleCreateOrg} className="max-w-md space-y-8">
					<div>
						<label className="label-sm mb-3 block" htmlFor="org">
							Legal or brand name
						</label>
						<Input
							id="org"
							value={newOrgName}
							onChange={(e) => setNewOrgName(e.target.value)}
							required
						/>
					</div>
					<Button type="submit" disabled={isSubmitting || !newOrgName.trim()}>
						{isSubmitting ? "Creating…" : "Create"}
					</Button>
				</form>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (step < 3) {
			setStep((s) => Math.min(3, s + 1));
			return;
		}
		try {
			setIsSubmitting(true);
			const primaryOrg = orgs.at(0);
			if (!primaryOrg) {
				toast.error("No organization found");
				return;
			}
			const slug =
				formData.slug ||
				formData.title
					.toLowerCase()
					.replace(/\s+/g, "-")
					.replace(/[^a-z0-9-]/g, "");
			const payload = {
				title: formData.title,
				slug,
				startsAt: new Date(formData.startDate).toISOString(),
				endsAt: formData.endDate
					? new Date(formData.endDate).toISOString()
					: new Date(
							new Date(formData.startDate).getTime() + 3600000,
						).toISOString(),
				venueName: formData.location,
				description: formData.description,
				coverUrl:
					"https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
				thumbnailUrl:
					"https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
				onlineUrl: "https://example.com",
				format: "IN_PERSON" as const,
				visibility: "PUBLIC" as const,
				status: "PUBLISHED" as const,
			};
			const created = await createEvent(primaryOrg.id, payload);
			toast.success("Event published");
			if (created?.id) router.push(`/dashboard/events/${created.id}/tickets`);
		} catch (error: unknown) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create event",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div>
			<Link
				href="/dashboard"
				className="label-sm mb-10 inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
			>
				<ArrowLeft className="h-4 w-4" /> Dashboard
			</Link>

			<p className="label-sm mb-4">New event</p>
			<h1 className="display-lg mb-12 max-w-[16ch]">Publish</h1>

			<div className="mb-12 flex gap-2">
				{[1, 2, 3].map((n) => (
					<div
						key={n}
						className={cn(
							"h-2 max-w-24 flex-1",
							step >= n ? "bg-primary" : "bg-muted",
						)}
					/>
				))}
			</div>

			<form onSubmit={handleSubmit} className="max-w-2xl space-y-12">
				{step === 1 && (
					<section className="space-y-8 bg-card p-8 md:p-10">
						<h2 className="headline-lg">Identity</h2>
						<div>
							<label htmlFor="event-title" className="label-sm mb-3 block">
								Title
							</label>
							<Input
								id="event-title"
								value={formData.title}
								onChange={(e) =>
									setFormData({
										...formData,
										title: e.target.value,
										slug: e.target.value
											.toLowerCase()
											.replace(/\s+/g, "-")
											.replace(/[^a-z0-9-]/g, ""),
									})
								}
								required
							/>
						</div>
						<div>
							<label htmlFor="event-slug" className="label-sm mb-3 block">
								Slug
							</label>
							<Input
								id="event-slug"
								value={formData.slug}
								onChange={(e) =>
									setFormData({ ...formData, slug: e.target.value })
								}
								placeholder="your-event-url"
							/>
						</div>
					</section>
				)}

				{step === 2 && (
					<section className="space-y-8 bg-card p-8 md:p-10">
						<h2 className="headline-lg">Schedule & place</h2>
						<div className="grid gap-8 sm:grid-cols-2">
							<div>
								<label htmlFor="event-start" className="label-sm mb-3 block">
									Starts
								</label>
								<Input
									id="event-start"
									type="datetime-local"
									value={formData.startDate}
									onChange={(e) =>
										setFormData({ ...formData, startDate: e.target.value })
									}
									required
								/>
							</div>
							<div>
								<label htmlFor="event-end" className="label-sm mb-3 block">
									Ends
								</label>
								<Input
									id="event-end"
									type="datetime-local"
									value={formData.endDate}
									onChange={(e) =>
										setFormData({ ...formData, endDate: e.target.value })
									}
								/>
							</div>
						</div>
						<div>
							<label htmlFor="event-venue" className="label-sm mb-3 block">
								Venue
							</label>
							<Input
								id="event-venue"
								value={formData.location}
								onChange={(e) =>
									setFormData({ ...formData, location: e.target.value })
								}
								required
							/>
						</div>
					</section>
				)}

				{step === 3 && (
					<section className="space-y-8 bg-card p-8 md:p-10">
						<h2 className="headline-lg">Story</h2>
						<div>
							<label
								htmlFor="event-description"
								className="label-sm mb-3 block"
							>
								Description
							</label>
							<textarea
								id="event-description"
								className={textareaClass}
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								required
							/>
						</div>
					</section>
				)}

				<div className="flex flex-wrap justify-between gap-4">
					{step > 1 ? (
						<Button
							type="button"
							variant="ghost"
							onClick={() => setStep((s) => Math.max(1, s - 1))}
						>
							Back
						</Button>
					) : (
						<span />
					)}
					<Button
						type="submit"
						className="gradient-cta border-0"
						disabled={isSubmitting || (step === 1 && !formData.title)}
					>
						{isSubmitting ? "Saving…" : step === 3 ? "Publish" : "Continue"}
					</Button>
				</div>
			</form>
		</div>
	);
}
