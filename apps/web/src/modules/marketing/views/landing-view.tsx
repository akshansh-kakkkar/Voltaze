import { SectionTitle } from "@/shared/ui/section-title";
import { FeatureGrid } from "../components/feature-grid";
import { Hero } from "../components/hero";

export function LandingView() {
	return (
		<div className="space-y-10 md:space-y-14">
			<Hero />

			<section className="panel-soft space-y-8 p-6 md:p-8">
				<SectionTitle
					eyebrow="Platform Highlights"
					title="Everything attendees and organizers need in one flow"
					description="The experience is now fully wired at the frontend layer: discovery, event detail, ticket management, and operational visibility."
				/>
				<FeatureGrid />
			</section>
		</div>
	);
}
