/**
 * Dev seed — run from repo root or packages/db:
 *
 *   SEED_USER_ID=<your-auth-sub> bun run packages/db/prisma/seed.ts
 *
 * Creates a demo org, published event, and ticket tiers.
 */
import db from "../src/index.ts";

async function main() {
	const userId = process.env.SEED_USER_ID;
	if (!userId) {
		console.warn(
			"Skip seed: set SEED_USER_ID to your auth user sub (JWT `sub`).",
		);
		return;
	}

	const slug = "voltaze-demo-night";
	const existing = await db.event.findUnique({ where: { slug } });
	if (existing) {
		console.log("Seed skipped: demo event already exists.");
		return;
	}

	const org = await db.organization.create({
		data: {
			name: "Voltaze Demo Org",
			slug: "voltaze-demo-org",
		},
	});

	await db.orgMember.create({
		data: {
			userId,
			orgId: org.id,
			role: "OWNER",
		},
	});

	const starts = new Date();
	starts.setDate(starts.getDate() + 14);
	const ends = new Date(starts);
	ends.setHours(ends.getHours() + 3);

	const event = await db.event.create({
		data: {
			orgId: org.id,
			slug,
			title: "Voltaze Demo Night",
			description:
				"Sample event for local MVP testing. Tickets below are created by the seed script.",
			summary: "Demo event",
			coverUrl:
				"https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
			thumbnailUrl:
				"https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
			onlineUrl: "https://example.com",
			timezone: "Asia/Kolkata",
			startsAt: starts,
			endsAt: ends,
			format: "IN_PERSON",
			visibility: "PUBLIC",
			status: "PUBLISHED",
			venueName: "Demo Hall",
			city: "Bengaluru",
			country: "IN",
		},
	});

	await db.ticketTier.createMany({
		data: [
			{
				eventId: event.id,
				name: "Community (free)",
				price: 0,
				quantity: 100,
				position: 0,
			},
			{
				eventId: event.id,
				name: "General",
				price: 499,
				quantity: 200,
				position: 1,
			},
		],
	});

	console.log(`Seeded event: /events/${slug}`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
