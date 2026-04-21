export function SectionTitle({
	eyebrow,
	title,
	description,
}: {
	eyebrow: string;
	title: string;
	description: string;
}) {
	return (
		<div className="space-y-2">
			<span className="chip">{eyebrow}</span>
			<h2 className="display-font max-w-2xl font-bold text-3xl text-[#0e1838] md:text-4xl">
				{title}
			</h2>
			<p className="max-w-2xl text-[#5f6984]">{description}</p>
		</div>
	);
}
