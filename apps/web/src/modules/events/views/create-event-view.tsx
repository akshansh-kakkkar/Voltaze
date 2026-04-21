"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateEvent } from "../hooks/use-events";
import { Button } from "@/shared/ui/button";
import { SectionTitle } from "@/shared/ui/section-title";

export function CreateEventView() {
	const router = useRouter();
	const createEventMutation = useCreateEvent();

	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		description: "",
		type: "SEMINAR",
		mode: "OFFLINE",
		startDate: new Date().toISOString().slice(0, 16),
		endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
		timezone: "Asia/Kolkata",
		venueName: "",
		address: "",
		coverUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
		thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
		visibility: "PUBLIC",
		status: "DRAFT",
	});

	function generateSlug(name: string) {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
			...(name === "name" && !prev.slug
				? { slug: generateSlug(value) }
				: {}),
		}));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		try {
			const { slug, status, ...validData } = formData;
			
			const event = await createEventMutation.mutateAsync({
				...validData,
				startDate: new Date(formData.startDate),
				endDate: new Date(formData.endDate),
				type: formData.type as any,
				mode: formData.mode as any,
				visibility: formData.visibility as any,
				latitude: "0.00",
				longitude: "0.00",
			});
			router.push(`/events/${event.id}`);
		} catch (error) {
			console.error("Failed to create event:", error);
			alert("Failed to create the event. Please check the form data.");
		}
	}

	return (
		<div className="mx-auto max-w-4xl space-y-8">
			<SectionTitle
				eyebrow="Host panel"
				title="Publish a new event"
				description="Define your event details, set the correct mode and dates, and let attendees know."
			/>

			<form onSubmit={handleSubmit} className="panel-soft space-y-6 p-6 md:p-8">
				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<label className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							Event Name
						</label>
						<input
							required
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="e.g. Next.js Conf 2026"
						/>
					</div>

					<div className="space-y-2">
						<label className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							URL Slug
						</label>
						<input
							required
							name="slug"
							value={formData.slug}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-[#f8faff] px-4 text-[#5f6984] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="nextjs-conf-2026"
						/>
					</div>

					<div className="space-y-2 md:col-span-2">
						<label className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={4}
							className="w-full rounded-xl border border-[#d4def8] bg-white p-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
							placeholder="Describe your event..."
						/>
					</div>

					<div className="space-y-2">
						<label className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							Start Date & Time
						</label>
						<input
							required
							type="datetime-local"
							name="startDate"
							value={formData.startDate}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						/>
					</div>

					<div className="space-y-2">
						<label className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							End Date & Time
						</label>
						<input
							required
							type="datetime-local"
							name="endDate"
							value={formData.endDate}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						/>
					</div>

					<div className="space-y-2">
						<label className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							Mode
						</label>
						<select
							name="mode"
							value={formData.mode}
							onChange={handleChange}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6]"
						>
							<option value="OFFLINE">Offline (In-person)</option>
							<option value="ONLINE">Online (Virtual)</option>
							<option value="HYBRID">Hybrid</option>
						</select>
					</div>

					<div className="space-y-2">
						<label className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
							Venue Name
						</label>
						<input
							name="venueName"
							value={formData.venueName}
							onChange={handleChange}
							disabled={formData.mode === "ONLINE"}
							className="h-11 w-full rounded-xl border border-[#d4def8] bg-white px-4 text-[#19254a] outline-none transition-colors focus:border-[#3a59d6] disabled:bg-[#f8faff] disabled:text-[#a0aabf]"
							placeholder={formData.mode === "ONLINE" ? "N/A" : "e.g. Moscone Center"}
						/>
					</div>
				</div>

				<div className="my-8 border-t border-[#d7e0f8]" />

				<div className="flex items-center gap-4">
					<Button
						type="submit"
						size="lg"
						disabled={createEventMutation.isPending}
					>
						{createEventMutation.isPending ? "Creating..." : "Create Event"}
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={() => router.back()}
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}
