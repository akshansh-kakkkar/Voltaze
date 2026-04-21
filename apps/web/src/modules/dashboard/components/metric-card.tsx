import { Card, CardText, CardTitle } from "@/shared/ui/card";

export function MetricCard({
	label,
	value,
	delta,
}: {
	label: string;
	value: string;
	delta: string;
}) {
	return (
		<Card className="space-y-2 p-5">
			<CardText className="font-semibold text-[#7a86a8] text-xs uppercase tracking-wide">
				{label}
			</CardText>
			<CardTitle className="text-3xl text-[#10204d]">{value}</CardTitle>
			<CardText>{delta}</CardText>
		</Card>
	);
}
