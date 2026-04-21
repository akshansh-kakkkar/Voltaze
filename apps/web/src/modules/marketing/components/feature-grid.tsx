import { Card, CardText, CardTitle } from "@/shared/ui/card";

const items = [
	{
		title: "Discovery",
		description:
			"Attendees can scan the full event lineup, then filter by category, mode, and seat availability.",
	},
	{
		title: "Registration",
		description:
			"Every event detail view provides clear schedule, audience, and CTA paths into ticket reservation.",
	},
	{
		title: "Mobile Passes",
		description:
			"Ticket Hub centralizes active, used, and expired passes with real-time style status visibility.",
	},
	{
		title: "Operations",
		description:
			"Dashboard cards summarize event inventory and pass readiness for faster event-day decisions.",
	},
] as const;

export function FeatureGrid() {
	return (
		<section className="grid gap-4 md:grid-cols-2">
			{items.map((item) => (
				<Card key={item.title} className="p-6">
					<CardTitle className="text-2xl">{item.title}</CardTitle>
					<CardText className="mt-2 text-base leading-relaxed">
						{item.description}
					</CardText>
				</Card>
			))}
		</section>
	);
}
