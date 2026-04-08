"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useEvent, useUpdateEvent } from "../../../../../features/events/index";
import { showNotification } from "../../../../../shared/lib/notifications";

function toDateTimeLocal(date: string | Date) {
	const d = new Date(date);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type EventFormState = {
	name: string;
	description: string;
	venueName: string;
	address: string;
	startDate: string;
	endDate: string;
	type: "FREE" | "PAID";
	mode: "ONLINE" | "OFFLINE";
	visibility: "PUBLIC" | "PRIVATE";
	status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
	coverUrl: string;
	thumbnail: string;
};

export default function EditHostEventPage() {
	const params = useParams<{ eventId: string }>();
	const eventId = typeof params?.eventId === "string" ? params.eventId : "";
	const router = useRouter();

	const eventQuery = useEvent(eventId);
	const updateEvent = useUpdateEvent(eventId);

	const [form, setForm] = useState<EventFormState | null>(null);

	useEffect(() => {
		const event = eventQuery.data;
		if (!event) return;

		setForm({
			name: event.name,
			description: event.description,
			venueName: event.venueName,
			address: event.address,
			startDate: toDateTimeLocal(event.startDate),
			endDate: toDateTimeLocal(event.endDate),
			type: event.type,
			mode: event.mode,
			visibility: event.visibility,
			status: event.status,
			coverUrl: event.coverUrl,
			thumbnail: event.thumbnail,
		});
	}, [eventQuery.data]);

	const isDirty = useMemo(() => {
		const event = eventQuery.data;
		if (!event || !form) return false;

		return (
			form.name !== event.name ||
			form.description !== event.description ||
			form.venueName !== event.venueName ||
			form.address !== event.address ||
			new Date(form.startDate).getTime() !==
				new Date(event.startDate).getTime() ||
			new Date(form.endDate).getTime() !== new Date(event.endDate).getTime() ||
			form.type !== event.type ||
			form.mode !== event.mode ||
			form.visibility !== event.visibility ||
			form.status !== event.status ||
			form.coverUrl !== event.coverUrl ||
			form.thumbnail !== event.thumbnail
		);
	}, [eventQuery.data, form]);

	const onChange = <K extends keyof EventFormState>(
		key: K,
		value: EventFormState[K],
	) => {
		setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!form || !eventId) return;

		await updateEvent.mutateAsync({
			name: form.name.trim(),
			description: form.description.trim(),
			venueName: form.venueName.trim(),
			address: form.address.trim(),
			startDate: new Date(form.startDate),
			endDate: new Date(form.endDate),
			type: form.type,
			mode: form.mode,
			visibility: form.visibility,
			status: form.status,
			coverUrl: form.coverUrl.trim() || "https://picsum.photos/1200/630",
			thumbnail: form.thumbnail.trim() || "https://picsum.photos/600/338",
		});

		showNotification({
			title: "Event saved",
			message: "Your event changes were saved.",
			color: "green",
		});

		router.push("/host/events" as Route);
	};

	if (eventQuery.isLoading || !form) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
				Loading event details...
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center gap-4">
				<Link
					href={"/host/events" as Route}
					className="rounded-lg p-2 transition-colors hover:bg-slate-100"
				>
					<ArrowLeft className="h-5 w-5 text-slate-600" />
				</Link>
				<div>
					<h1 className="font-black text-3xl text-slate-900 tracking-tight">
						Edit Event
					</h1>
					<p className="mt-1 text-slate-600">
						Update event details and publishing state.
					</p>
				</div>
			</div>

			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
				<form className="space-y-6" onSubmit={handleSubmit}>
					<Section title="Event details">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<Field label="Event name" required>
								<input
									required
									value={form.name}
									onChange={(e) => onChange("name", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
							<Field label="Venue" required>
								<input
									required
									value={form.venueName}
									onChange={(e) => onChange("venueName", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
						</div>

						<Field label="Address" required>
							<input
								required
								value={form.address}
								onChange={(e) => onChange("address", e.target.value)}
								className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
							/>
						</Field>

						<Field label="Description" required>
							<textarea
								required
								rows={4}
								value={form.description}
								onChange={(e) => onChange("description", e.target.value)}
								className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
							/>
						</Field>
					</Section>

					<Section title="Schedule and settings">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<Field label="Start" required>
								<input
									required
									type="datetime-local"
									value={form.startDate}
									onChange={(e) => onChange("startDate", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
							<Field label="End" required>
								<input
									required
									type="datetime-local"
									value={form.endDate}
									onChange={(e) => onChange("endDate", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
						</div>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-4">
							<Field label="Type">
								<select
									value={form.type}
									onChange={(e) =>
										onChange("type", e.target.value as EventFormState["type"])
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="PAID">PAID</option>
									<option value="FREE">FREE</option>
								</select>
							</Field>
							<Field label="Mode">
								<select
									value={form.mode}
									onChange={(e) =>
										onChange("mode", e.target.value as EventFormState["mode"])
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="OFFLINE">OFFLINE</option>
									<option value="ONLINE">ONLINE</option>
								</select>
							</Field>
							<Field label="Visibility">
								<select
									value={form.visibility}
									onChange={(e) =>
										onChange(
											"visibility",
											e.target.value as EventFormState["visibility"],
										)
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="PUBLIC">PUBLIC</option>
									<option value="PRIVATE">PRIVATE</option>
								</select>
							</Field>
							<Field label="Status">
								<select
									value={form.status}
									onChange={(e) =>
										onChange(
											"status",
											e.target.value as EventFormState["status"],
										)
									}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								>
									<option value="DRAFT">DRAFT</option>
									<option value="PUBLISHED">PUBLISHED</option>
									<option value="COMPLETED">COMPLETED</option>
									<option value="CANCELLED">CANCELLED</option>
								</select>
							</Field>
						</div>
					</Section>

					<Section title="Media links">
						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<Field label="Cover URL">
								<input
									value={form.coverUrl}
									onChange={(e) => onChange("coverUrl", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
							<Field label="Thumbnail URL">
								<input
									value={form.thumbnail}
									onChange={(e) => onChange("thumbnail", e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
								/>
							</Field>
						</div>
					</Section>

					<div className="flex gap-3 pt-2">
						<Link
							href={"/host/events" as Route}
							className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-100"
						>
							Cancel
						</Link>
						<button
							type="submit"
							disabled={updateEvent.isPending || !isDirty}
							className="flex-1 rounded-lg bg-[#0a4bb8] px-5 py-2.5 font-semibold text-white hover:bg-[#0a4bb8]/90 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{updateEvent.isPending ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Saving...
								</span>
							) : (
								<span className="inline-flex items-center gap-2">
									<Save className="h-4 w-4" />
									Save Changes
								</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border border-[#dbe7ff] bg-[#f8fbff] p-5">
			<h2 className="mb-4 font-bold text-lg text-slate-900">{title}</h2>
			<div className="space-y-5">{children}</div>
		</div>
	);
}

function Field({
	label,
	required,
	children,
}: {
	label: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div>
			<p className="mb-2 block font-semibold text-slate-800 text-sm">
				{label} {required ? <span className="text-rose-500">*</span> : null}
			</p>
			{children}
		</div>
	);
}
