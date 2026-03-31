import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";

import {
	CheckInMethod,
	EventMode,
	EventStatus,
	EventType,
	EventVisibility,
	OrderStatus,
	PassStatus,
	PassType,
	PaymentGateway,
	PaymentStatus,
	PrismaClient,
	UserRole,
} from "./generated/client";

const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function deterministicHex(seed: string, length: number): string {
	let output = "";
	let counter = 0;

	while (output.length < length) {
		output += createHash("sha256").update(`${seed}:${counter}`).digest("hex");
		counter += 1;
	}

	return output.slice(0, length);
}

function buildSeedCuid(seed: string): string {
	return `c${deterministicHex(`cuid:${seed}`, 24)}`;
}

function buildSeedUlid(seed: string): string {
	let output = "";
	let counter = 0;

	while (output.length < 26) {
		const bytes = createHash("sha256")
			.update(`ulid:${seed}:${counter}`)
			.digest();

		for (const byte of bytes) {
			output += ULID_ALPHABET[byte % ULID_ALPHABET.length];

			if (output.length === 26) {
				break;
			}
		}

		counter += 1;
	}

	return output;
}

const envCandidates = [
	path.resolve(import.meta.dir, "../../../apps/server/.env"),
	path.resolve(process.cwd(), "apps/server/.env"),
	path.resolve(process.cwd(), "../../apps/server/.env"),
] as const;

let resolvedEnvPath: string | null = null;

for (const envPath of envCandidates) {
	if (!existsSync(envPath)) {
		continue;
	}

	dotenv.config({
		path: envPath,
		override: false,
	});

	resolvedEnvPath = envPath;
	break;
}

if (!resolvedEnvPath) {
	dotenv.config();
}

if (!process.env.DATABASE_URL) {
	throw new Error(
		`DATABASE_URL is missing. Add it to apps/server/.env before running db:seed. Attempted: ${envCandidates.join(", ")}`,
	);
}

const prisma = new PrismaClient({
	adapter: new PrismaNeon({
		connectionString: process.env.DATABASE_URL,
	}),
});

const seedIds = {
	users: {
		admin: buildSeedUlid("seed-user-admin-ananya-rao"),
		hostMaya: buildSeedUlid("seed-user-host-maya-kapoor"),
		hostRohan: buildSeedUlid("seed-user-host-rohan-sen"),
		attendeeNeha: buildSeedUlid("seed-user-attendee-neha-iyer"),
		attendeeKabir: buildSeedUlid("seed-user-attendee-kabir-shah"),
		attendeeAarav: buildSeedUlid("seed-user-attendee-aarav-menon"),
	},
	sessions: {
		admin: buildSeedUlid("seed-session-admin-ananya"),
		hostMaya: buildSeedUlid("seed-session-host-maya"),
		attendeeNeha: buildSeedUlid("seed-session-attendee-neha"),
	},
	accounts: {
		adminCredentials: buildSeedUlid("seed-account-admin-credentials"),
		hostMayaCredentials: buildSeedUlid("seed-account-host-maya-credentials"),
		hostRohanCredentials: buildSeedUlid("seed-account-host-rohan-credentials"),
		attendeeNehaCredentials: buildSeedUlid(
			"seed-account-attendee-neha-credentials",
		),
	},
	verifications: {
		adminEmail: "seed_verification_admin_email",
		attendeeAaravEmail: "seed_verification_attendee_aarav_email",
	},
	events: {
		summit2026: buildSeedCuid("seed-event-voltaze-product-summit-2026"),
		meetup2026: buildSeedCuid("seed-event-open-source-meetup-2026"),
		foundersRoundtable2026: buildSeedCuid(
			"seed-event-founders-roundtable-2026",
		),
	},
	tiers: {
		summitStandard: buildSeedCuid("seed-tier-summit-standard"),
		summitPro: buildSeedCuid("seed-tier-summit-pro"),
		meetupAccess: buildSeedCuid("seed-tier-meetup-access"),
		foundersInvite: buildSeedCuid("seed-tier-founders-invite"),
	},
	attendees: {
		summitNeha: buildSeedCuid("seed-attendee-summit-neha"),
		summitKabir: buildSeedCuid("seed-attendee-summit-kabir"),
		summitWalkIn: buildSeedCuid("seed-attendee-summit-walkin"),
		meetupAarav: buildSeedCuid("seed-attendee-meetup-aarav"),
		foundersNeha: buildSeedCuid("seed-attendee-founders-neha"),
	},
	orders: {
		summitNehaCompleted: buildSeedCuid("seed-order-summit-neha-completed"),
		summitKabirCompleted: buildSeedCuid("seed-order-summit-kabir-completed"),
		summitWalkInCancelled: buildSeedCuid("seed-order-summit-walkin-cancelled"),
		meetupAaravCompleted: buildSeedCuid("seed-order-meetup-aarav-completed"),
		foundersNehaPending: buildSeedCuid("seed-order-founders-neha-pending"),
	},
	tickets: {
		summitNehaStandard: buildSeedCuid("seed-ticket-summit-neha-standard"),
		summitKabirPro: buildSeedCuid("seed-ticket-summit-kabir-pro"),
		summitWalkInStandard: buildSeedCuid("seed-ticket-summit-walkin-standard"),
		meetupAaravAccess: buildSeedCuid("seed-ticket-meetup-aarav-access"),
	},
	passes: {
		summitNehaActive: buildSeedCuid("seed-pass-summit-neha-active"),
		summitKabirUsed: buildSeedCuid("seed-pass-summit-kabir-used"),
		summitWalkInCancelled: buildSeedCuid("seed-pass-summit-walkin-cancelled"),
		meetupAaravUsed: buildSeedCuid("seed-pass-meetup-aarav-used"),
	},
	payments: {
		summitNehaSuccess: buildSeedCuid("seed-payment-summit-neha-success"),
		summitKabirSuccess: buildSeedCuid("seed-payment-summit-kabir-success"),
		summitWalkInRefunded: buildSeedCuid("seed-payment-summit-walkin-refunded"),
		meetupAaravSuccess: buildSeedCuid("seed-payment-meetup-aarav-success"),
		foundersNehaPending: buildSeedCuid("seed-payment-founders-neha-pending"),
	},
	checkIns: {
		summitKabir: buildSeedCuid("seed-checkin-summit-kabir"),
		meetupAarav: buildSeedCuid("seed-checkin-meetup-aarav"),
	},
} as const;

const baseTierIds = [
	seedIds.tiers.summitStandard,
	seedIds.tiers.summitPro,
	seedIds.tiers.meetupAccess,
	seedIds.tiers.foundersInvite,
] as const;

type DetailedCoverageSummary = {
	users: number;
	events: number;
	tiers: number;
	attendees: number;
	orders: number;
	tickets: number;
	passes: number;
	payments: number;
	checkIns: number;
};

type DetailedSeedResult = {
	adminEmail: string;
	primaryEventSlug: string;
	primaryEventId: string;
	primaryTierId: string;
	summary: DetailedCoverageSummary;
};

async function syncTierSoldCounts(tierIds: readonly string[]): Promise<void> {
	for (const tierId of tierIds) {
		const soldCount = await prisma.ticket.count({
			where: { tierId },
		});

		await prisma.ticketTier.update({
			where: { id: tierId },
			data: { soldCount },
		});
	}
}

async function collectDetailedCoverageSummary(): Promise<DetailedCoverageSummary> {
	return {
		users: await prisma.user.count({
			where: { id: { in: Object.values(seedIds.users) } },
		}),
		events: await prisma.event.count({
			where: { id: { in: Object.values(seedIds.events) } },
		}),
		tiers: await prisma.ticketTier.count({
			where: { id: { in: Object.values(seedIds.tiers) } },
		}),
		attendees: await prisma.attendee.count({
			where: { id: { in: Object.values(seedIds.attendees) } },
		}),
		orders: await prisma.order.count({
			where: { id: { in: Object.values(seedIds.orders) } },
		}),
		tickets: await prisma.ticket.count({
			where: { id: { in: Object.values(seedIds.tickets) } },
		}),
		passes: await prisma.pass.count({
			where: { id: { in: Object.values(seedIds.passes) } },
		}),
		payments: await prisma.payment.count({
			where: { id: { in: Object.values(seedIds.payments) } },
		}),
		checkIns: await prisma.checkIn.count({
			where: { id: { in: Object.values(seedIds.checkIns) } },
		}),
	};
}

async function seedDetailed(): Promise<DetailedSeedResult> {
	const seededAt = new Date("2026-03-31T08:00:00.000Z");

	const adminUser = await prisma.user.upsert({
		where: { id: seedIds.users.admin },
		update: {
			name: "Ananya Rao",
			email: "ananya.admin@voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
			role: UserRole.ADMIN,
		},
		create: {
			id: seedIds.users.admin,
			name: "Ananya Rao",
			email: "ananya.admin@voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
			role: UserRole.ADMIN,
		},
	});

	const hostMayaUser = await prisma.user.upsert({
		where: { id: seedIds.users.hostMaya },
		update: {
			name: "Maya Kapoor",
			email: "maya.kapoor@voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
			role: UserRole.HOST,
		},
		create: {
			id: seedIds.users.hostMaya,
			name: "Maya Kapoor",
			email: "maya.kapoor@voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
			role: UserRole.HOST,
		},
	});

	const hostRohanUser = await prisma.user.upsert({
		where: { id: seedIds.users.hostRohan },
		update: {
			name: "Rohan Sen",
			email: "rohan.sen@voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
			role: UserRole.HOST,
		},
		create: {
			id: seedIds.users.hostRohan,
			name: "Rohan Sen",
			email: "rohan.sen@voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
			role: UserRole.HOST,
		},
	});

	const attendeeNehaUser = await prisma.user.upsert({
		where: { id: seedIds.users.attendeeNeha },
		update: {
			name: "Neha Iyer",
			email: "neha.iyer@community.voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
			role: UserRole.USER,
		},
		create: {
			id: seedIds.users.attendeeNeha,
			name: "Neha Iyer",
			email: "neha.iyer@community.voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
			role: UserRole.USER,
		},
	});

	const attendeeKabirUser = await prisma.user.upsert({
		where: { id: seedIds.users.attendeeKabir },
		update: {
			name: "Kabir Shah",
			email: "kabir.shah@community.voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128",
			role: UserRole.USER,
		},
		create: {
			id: seedIds.users.attendeeKabir,
			name: "Kabir Shah",
			email: "kabir.shah@community.voltaze.app",
			emailVerified: true,
			image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128",
			role: UserRole.USER,
		},
	});

	const attendeeAaravUser = await prisma.user.upsert({
		where: { id: seedIds.users.attendeeAarav },
		update: {
			name: "Aarav Menon",
			email: "aarav.menon@community.voltaze.app",
			emailVerified: false,
			image: "https://images.unsplash.com/photo-1521119989659-a83eee488004",
			role: UserRole.USER,
		},
		create: {
			id: seedIds.users.attendeeAarav,
			name: "Aarav Menon",
			email: "aarav.menon@community.voltaze.app",
			emailVerified: false,
			image: "https://images.unsplash.com/photo-1521119989659-a83eee488004",
			role: UserRole.USER,
		},
	});

	const sessionExpiry = new Date("2026-12-31T23:59:59.000Z");

	await prisma.session.upsert({
		where: { id: seedIds.sessions.admin },
		update: {
			expiresAt: sessionExpiry,
			token: "seed_refresh_admin_ananya",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: adminUser.id,
		},
		create: {
			id: seedIds.sessions.admin,
			expiresAt: sessionExpiry,
			token: "seed_refresh_admin_ananya",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: adminUser.id,
		},
	});

	await prisma.session.upsert({
		where: { id: seedIds.sessions.hostMaya },
		update: {
			expiresAt: sessionExpiry,
			token: "seed_refresh_host_maya",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: hostMayaUser.id,
		},
		create: {
			id: seedIds.sessions.hostMaya,
			expiresAt: sessionExpiry,
			token: "seed_refresh_host_maya",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: hostMayaUser.id,
		},
	});

	await prisma.session.upsert({
		where: { id: seedIds.sessions.attendeeNeha },
		update: {
			expiresAt: sessionExpiry,
			token: "seed_refresh_attendee_neha",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: attendeeNehaUser.id,
		},
		create: {
			id: seedIds.sessions.attendeeNeha,
			expiresAt: sessionExpiry,
			token: "seed_refresh_attendee_neha",
			ipAddress: "127.0.0.1",
			userAgent: "Voltaze Seed Script",
			userId: attendeeNehaUser.id,
		},
	});

	const [
		adminPasswordHash,
		hostMayaPasswordHash,
		hostRohanPasswordHash,
		attendeeNehaPasswordHash,
	] = await Promise.all([
		Bun.password.hash("AdminVoltaze@123"),
		Bun.password.hash("HostMaya@123"),
		Bun.password.hash("HostRohan@123"),
		Bun.password.hash("AttendeeNeha@123"),
	]);

	await prisma.account.upsert({
		where: { id: seedIds.accounts.adminCredentials },
		update: {
			accountId: adminUser.email,
			providerId: "credentials",
			userId: adminUser.id,
			password: adminPasswordHash,
		},
		create: {
			id: seedIds.accounts.adminCredentials,
			accountId: adminUser.email,
			providerId: "credentials",
			userId: adminUser.id,
			password: adminPasswordHash,
		},
	});

	await prisma.account.upsert({
		where: { id: seedIds.accounts.hostMayaCredentials },
		update: {
			accountId: hostMayaUser.email,
			providerId: "credentials",
			userId: hostMayaUser.id,
			password: hostMayaPasswordHash,
		},
		create: {
			id: seedIds.accounts.hostMayaCredentials,
			accountId: hostMayaUser.email,
			providerId: "credentials",
			userId: hostMayaUser.id,
			password: hostMayaPasswordHash,
		},
	});

	await prisma.account.upsert({
		where: { id: seedIds.accounts.hostRohanCredentials },
		update: {
			accountId: hostRohanUser.email,
			providerId: "credentials",
			userId: hostRohanUser.id,
			password: hostRohanPasswordHash,
		},
		create: {
			id: seedIds.accounts.hostRohanCredentials,
			accountId: hostRohanUser.email,
			providerId: "credentials",
			userId: hostRohanUser.id,
			password: hostRohanPasswordHash,
		},
	});

	await prisma.account.upsert({
		where: { id: seedIds.accounts.attendeeNehaCredentials },
		update: {
			accountId: attendeeNehaUser.email,
			providerId: "credentials",
			userId: attendeeNehaUser.id,
			password: attendeeNehaPasswordHash,
		},
		create: {
			id: seedIds.accounts.attendeeNehaCredentials,
			accountId: attendeeNehaUser.email,
			providerId: "credentials",
			userId: attendeeNehaUser.id,
			password: attendeeNehaPasswordHash,
		},
	});

	await prisma.verification.upsert({
		where: { id: seedIds.verifications.adminEmail },
		update: {
			identifier: adminUser.email,
			value: "ADMIN-EMAIL-OTP-551122",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
		create: {
			id: seedIds.verifications.adminEmail,
			identifier: adminUser.email,
			value: "ADMIN-EMAIL-OTP-551122",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
	});

	await prisma.verification.upsert({
		where: { id: seedIds.verifications.attendeeAaravEmail },
		update: {
			identifier: attendeeAaravUser.email,
			value: "AARAV-EMAIL-OTP-884433",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
		create: {
			id: seedIds.verifications.attendeeAaravEmail,
			identifier: attendeeAaravUser.email,
			value: "AARAV-EMAIL-OTP-884433",
			expiresAt: new Date("2026-12-31T00:00:00.000Z"),
		},
	});

	const summitEvent = await prisma.event.upsert({
		where: { id: seedIds.events.summit2026 },
		update: {
			name: "Voltaze Product Summit 2026",
			slug: "voltaze-product-summit-2026",
			userId: hostMayaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
			thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865",
			venueName: "KTPO Convention Centre",
			address: "Whitefield, Bengaluru, Karnataka, India",
			latitude: "12.9868",
			longitude: "77.7294",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-05-16T04:30:00.000Z"),
			endDate: new Date("2026-05-16T13:30:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Annual product summit with roadmap announcements, customer stories, and partner demos.",
		},
		create: {
			id: seedIds.events.summit2026,
			name: "Voltaze Product Summit 2026",
			slug: "voltaze-product-summit-2026",
			userId: hostMayaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
			thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865",
			venueName: "KTPO Convention Centre",
			address: "Whitefield, Bengaluru, Karnataka, India",
			latitude: "12.9868",
			longitude: "77.7294",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-05-16T04:30:00.000Z"),
			endDate: new Date("2026-05-16T13:30:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Annual product summit with roadmap announcements, customer stories, and partner demos.",
		},
	});

	const meetupEvent = await prisma.event.upsert({
		where: { id: seedIds.events.meetup2026 },
		update: {
			name: "Open Source Meetup: APIs at Scale",
			slug: "open-source-meetup-apis-at-scale-2026",
			userId: hostRohanUser.id,
			coverUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
			thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
			venueName: "Voltaze Live Studio",
			address: "Online Event",
			latitude: "0",
			longitude: "0",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-04-18T12:30:00.000Z"),
			endDate: new Date("2026-04-18T15:00:00.000Z"),
			type: EventType.FREE,
			mode: EventMode.ONLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Community-led online meetup covering API reliability, tracing, and event-driven architecture.",
		},
		create: {
			id: seedIds.events.meetup2026,
			name: "Open Source Meetup: APIs at Scale",
			slug: "open-source-meetup-apis-at-scale-2026",
			userId: hostRohanUser.id,
			coverUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
			thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
			venueName: "Voltaze Live Studio",
			address: "Online Event",
			latitude: "0",
			longitude: "0",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-04-18T12:30:00.000Z"),
			endDate: new Date("2026-04-18T15:00:00.000Z"),
			type: EventType.FREE,
			mode: EventMode.ONLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			description:
				"Community-led online meetup covering API reliability, tracing, and event-driven architecture.",
		},
	});

	const foundersRoundtableEvent = await prisma.event.upsert({
		where: { id: seedIds.events.foundersRoundtable2026 },
		update: {
			name: "Voltaze Founder Roundtable",
			slug: "voltaze-founder-roundtable-2026",
			userId: hostMayaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
			thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978",
			venueName: "The Leela Business Hall",
			address: "Andheri East, Mumbai, Maharashtra, India",
			latitude: "19.1136",
			longitude: "72.8697",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-07-12T04:00:00.000Z"),
			endDate: new Date("2026-07-12T11:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PRIVATE,
			status: EventStatus.DRAFT,
			description:
				"Invite-only strategy roundtable for startup founders and early-stage operators.",
		},
		create: {
			id: seedIds.events.foundersRoundtable2026,
			name: "Voltaze Founder Roundtable",
			slug: "voltaze-founder-roundtable-2026",
			userId: hostMayaUser.id,
			coverUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
			thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978",
			venueName: "The Leela Business Hall",
			address: "Andheri East, Mumbai, Maharashtra, India",
			latitude: "19.1136",
			longitude: "72.8697",
			timezone: "Asia/Kolkata",
			startDate: new Date("2026-07-12T04:00:00.000Z"),
			endDate: new Date("2026-07-12T11:00:00.000Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PRIVATE,
			status: EventStatus.DRAFT,
			description:
				"Invite-only strategy roundtable for startup founders and early-stage operators.",
		},
	});

	const summitStandardTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.summitStandard },
		update: {
			eventId: summitEvent.id,
			name: "Summit Standard",
			description:
				"Full-day access to sessions, demo floor, and networking lounge.",
			price: 249900,
			maxQuantity: 500,
			soldCount: 0,
			salesStart: new Date("2026-03-20T00:00:00.000Z"),
			salesEnd: new Date("2026-05-15T18:30:00.000Z"),
		},
		create: {
			id: seedIds.tiers.summitStandard,
			eventId: summitEvent.id,
			name: "Summit Standard",
			description:
				"Full-day access to sessions, demo floor, and networking lounge.",
			price: 249900,
			maxQuantity: 500,
			soldCount: 0,
			salesStart: new Date("2026-03-20T00:00:00.000Z"),
			salesEnd: new Date("2026-05-15T18:30:00.000Z"),
		},
	});

	const summitProTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.summitPro },
		update: {
			eventId: summitEvent.id,
			name: "Summit Pro",
			description:
				"Priority seating, speaker Q&A room access, and post-event networking dinner.",
			price: 499900,
			maxQuantity: 120,
			soldCount: 0,
			salesStart: new Date("2026-03-20T00:00:00.000Z"),
			salesEnd: new Date("2026-05-15T18:30:00.000Z"),
		},
		create: {
			id: seedIds.tiers.summitPro,
			eventId: summitEvent.id,
			name: "Summit Pro",
			description:
				"Priority seating, speaker Q&A room access, and post-event networking dinner.",
			price: 499900,
			maxQuantity: 120,
			soldCount: 0,
			salesStart: new Date("2026-03-20T00:00:00.000Z"),
			salesEnd: new Date("2026-05-15T18:30:00.000Z"),
		},
	});

	const meetupAccessTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.meetupAccess },
		update: {
			eventId: meetupEvent.id,
			name: "Community Access",
			description: "Livestream access with interactive Q&A chat.",
			price: 0,
			maxQuantity: 10000,
			soldCount: 0,
			salesStart: new Date("2026-03-25T00:00:00.000Z"),
			salesEnd: new Date("2026-04-18T12:00:00.000Z"),
		},
		create: {
			id: seedIds.tiers.meetupAccess,
			eventId: meetupEvent.id,
			name: "Community Access",
			description: "Livestream access with interactive Q&A chat.",
			price: 0,
			maxQuantity: 10000,
			soldCount: 0,
			salesStart: new Date("2026-03-25T00:00:00.000Z"),
			salesEnd: new Date("2026-04-18T12:00:00.000Z"),
		},
	});

	const foundersInviteTier = await prisma.ticketTier.upsert({
		where: { id: seedIds.tiers.foundersInvite },
		update: {
			eventId: foundersRoundtableEvent.id,
			name: "Founder Invite",
			description: "Curated roundtable invite with lunch and closed-door AMA.",
			price: 149900,
			maxQuantity: 80,
			soldCount: 0,
			salesStart: new Date("2026-05-20T00:00:00.000Z"),
			salesEnd: new Date("2026-07-09T18:30:00.000Z"),
		},
		create: {
			id: seedIds.tiers.foundersInvite,
			eventId: foundersRoundtableEvent.id,
			name: "Founder Invite",
			description: "Curated roundtable invite with lunch and closed-door AMA.",
			price: 149900,
			maxQuantity: 80,
			soldCount: 0,
			salesStart: new Date("2026-05-20T00:00:00.000Z"),
			salesEnd: new Date("2026-07-09T18:30:00.000Z"),
		},
	});

	const summitNehaAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.summitNeha },
		update: {
			userId: attendeeNehaUser.id,
			eventId: summitEvent.id,
			name: "Neha Iyer",
			email: attendeeNehaUser.email,
			phone: "+918888000001",
		},
		create: {
			id: seedIds.attendees.summitNeha,
			userId: attendeeNehaUser.id,
			eventId: summitEvent.id,
			name: "Neha Iyer",
			email: attendeeNehaUser.email,
			phone: "+918888000001",
		},
	});

	const summitKabirAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.summitKabir },
		update: {
			userId: attendeeKabirUser.id,
			eventId: summitEvent.id,
			name: "Kabir Shah",
			email: attendeeKabirUser.email,
			phone: "+918888000002",
		},
		create: {
			id: seedIds.attendees.summitKabir,
			userId: attendeeKabirUser.id,
			eventId: summitEvent.id,
			name: "Kabir Shah",
			email: attendeeKabirUser.email,
			phone: "+918888000002",
		},
	});

	const summitWalkInAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.summitWalkIn },
		update: {
			userId: null,
			eventId: summitEvent.id,
			name: "Walk-in Delegate",
			email: "walkin.delegate@guest.voltaze.app",
			phone: "+918888000003",
		},
		create: {
			id: seedIds.attendees.summitWalkIn,
			userId: null,
			eventId: summitEvent.id,
			name: "Walk-in Delegate",
			email: "walkin.delegate@guest.voltaze.app",
			phone: "+918888000003",
		},
	});

	const meetupAaravAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.meetupAarav },
		update: {
			userId: attendeeAaravUser.id,
			eventId: meetupEvent.id,
			name: "Aarav Menon",
			email: attendeeAaravUser.email,
			phone: "+918888000004",
		},
		create: {
			id: seedIds.attendees.meetupAarav,
			userId: attendeeAaravUser.id,
			eventId: meetupEvent.id,
			name: "Aarav Menon",
			email: attendeeAaravUser.email,
			phone: "+918888000004",
		},
	});

	const foundersNehaAttendee = await prisma.attendee.upsert({
		where: { id: seedIds.attendees.foundersNeha },
		update: {
			userId: attendeeNehaUser.id,
			eventId: foundersRoundtableEvent.id,
			name: "Neha Iyer",
			email: attendeeNehaUser.email,
			phone: "+918888000005",
		},
		create: {
			id: seedIds.attendees.foundersNeha,
			userId: attendeeNehaUser.id,
			eventId: foundersRoundtableEvent.id,
			name: "Neha Iyer",
			email: attendeeNehaUser.email,
			phone: "+918888000005",
		},
	});

	const summitNehaOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.summitNehaCompleted },
		update: {
			attendeeId: summitNehaAttendee.id,
			eventId: summitEvent.id,
			status: OrderStatus.COMPLETED,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.summitNehaCompleted,
			attendeeId: summitNehaAttendee.id,
			eventId: summitEvent.id,
			status: OrderStatus.COMPLETED,
		},
	});

	const summitKabirOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.summitKabirCompleted },
		update: {
			attendeeId: summitKabirAttendee.id,
			eventId: summitEvent.id,
			status: OrderStatus.COMPLETED,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.summitKabirCompleted,
			attendeeId: summitKabirAttendee.id,
			eventId: summitEvent.id,
			status: OrderStatus.COMPLETED,
		},
	});

	const summitWalkInOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.summitWalkInCancelled },
		update: {
			attendeeId: summitWalkInAttendee.id,
			eventId: summitEvent.id,
			status: OrderStatus.CANCELLED,
			deletedAt: seededAt,
		},
		create: {
			id: seedIds.orders.summitWalkInCancelled,
			attendeeId: summitWalkInAttendee.id,
			eventId: summitEvent.id,
			status: OrderStatus.CANCELLED,
			deletedAt: seededAt,
		},
	});

	const meetupAaravOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.meetupAaravCompleted },
		update: {
			attendeeId: meetupAaravAttendee.id,
			eventId: meetupEvent.id,
			status: OrderStatus.COMPLETED,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.meetupAaravCompleted,
			attendeeId: meetupAaravAttendee.id,
			eventId: meetupEvent.id,
			status: OrderStatus.COMPLETED,
		},
	});

	const foundersNehaOrder = await prisma.order.upsert({
		where: { id: seedIds.orders.foundersNehaPending },
		update: {
			attendeeId: foundersNehaAttendee.id,
			eventId: foundersRoundtableEvent.id,
			status: OrderStatus.PENDING,
			deletedAt: null,
		},
		create: {
			id: seedIds.orders.foundersNehaPending,
			attendeeId: foundersNehaAttendee.id,
			eventId: foundersRoundtableEvent.id,
			status: OrderStatus.PENDING,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.summitNehaSuccess },
		update: {
			orderId: summitNehaOrder.id,
			amount: summitStandardTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_summit_neha_success",
			gatewayMeta: {
				scenario: "summit-standard-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.summitNehaSuccess,
			orderId: summitNehaOrder.id,
			amount: summitStandardTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_summit_neha_success",
			gatewayMeta: {
				scenario: "summit-standard-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.summitKabirSuccess },
		update: {
			orderId: summitKabirOrder.id,
			amount: summitProTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_summit_kabir_success",
			gatewayMeta: {
				scenario: "summit-pro-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.summitKabirSuccess,
			orderId: summitKabirOrder.id,
			amount: summitProTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_summit_kabir_success",
			gatewayMeta: {
				scenario: "summit-pro-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.summitWalkInRefunded },
		update: {
			orderId: summitWalkInOrder.id,
			amount: summitStandardTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_summit_walkin_refunded",
			gatewayMeta: {
				scenario: "summit-walkin-cancel-refund",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.REFUNDED,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.summitWalkInRefunded,
			orderId: summitWalkInOrder.id,
			amount: summitStandardTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_summit_walkin_refunded",
			gatewayMeta: {
				scenario: "summit-walkin-cancel-refund",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.REFUNDED,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.meetupAaravSuccess },
		update: {
			orderId: meetupAaravOrder.id,
			amount: meetupAccessTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_meetup_aarav_success",
			gatewayMeta: {
				scenario: "meetup-free-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.meetupAaravSuccess,
			orderId: meetupAaravOrder.id,
			amount: meetupAccessTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_meetup_aarav_success",
			gatewayMeta: {
				scenario: "meetup-free-success",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.SUCCESS,
		},
	});

	await prisma.payment.upsert({
		where: { id: seedIds.payments.foundersNehaPending },
		update: {
			orderId: foundersNehaOrder.id,
			amount: foundersInviteTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_founders_neha_pending",
			gatewayMeta: {
				scenario: "founders-draft-pending",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.PENDING,
			deletedAt: null,
		},
		create: {
			id: seedIds.payments.foundersNehaPending,
			orderId: foundersNehaOrder.id,
			amount: foundersInviteTier.price,
			currency: "INR",
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "seed_txn_founders_neha_pending",
			gatewayMeta: {
				scenario: "founders-draft-pending",
				seededAt: seededAt.toISOString(),
			},
			status: PaymentStatus.PENDING,
		},
	});

	const summitNehaTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.summitNehaStandard },
		update: {
			orderId: summitNehaOrder.id,
			eventId: summitEvent.id,
			tierId: summitStandardTier.id,
			pricePaid: summitStandardTier.price,
		},
		create: {
			id: seedIds.tickets.summitNehaStandard,
			orderId: summitNehaOrder.id,
			eventId: summitEvent.id,
			tierId: summitStandardTier.id,
			pricePaid: summitStandardTier.price,
		},
	});

	const summitKabirTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.summitKabirPro },
		update: {
			orderId: summitKabirOrder.id,
			eventId: summitEvent.id,
			tierId: summitProTier.id,
			pricePaid: summitProTier.price,
		},
		create: {
			id: seedIds.tickets.summitKabirPro,
			orderId: summitKabirOrder.id,
			eventId: summitEvent.id,
			tierId: summitProTier.id,
			pricePaid: summitProTier.price,
		},
	});

	const summitWalkInTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.summitWalkInStandard },
		update: {
			orderId: summitWalkInOrder.id,
			eventId: summitEvent.id,
			tierId: summitStandardTier.id,
			pricePaid: summitStandardTier.price,
		},
		create: {
			id: seedIds.tickets.summitWalkInStandard,
			orderId: summitWalkInOrder.id,
			eventId: summitEvent.id,
			tierId: summitStandardTier.id,
			pricePaid: summitStandardTier.price,
		},
	});

	const meetupAaravTicket = await prisma.ticket.upsert({
		where: { id: seedIds.tickets.meetupAaravAccess },
		update: {
			orderId: meetupAaravOrder.id,
			eventId: meetupEvent.id,
			tierId: meetupAccessTier.id,
			pricePaid: meetupAccessTier.price,
		},
		create: {
			id: seedIds.tickets.meetupAaravAccess,
			orderId: meetupAaravOrder.id,
			eventId: meetupEvent.id,
			tierId: meetupAccessTier.id,
			pricePaid: meetupAccessTier.price,
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.summitNehaActive },
		update: {
			eventId: summitEvent.id,
			attendeeId: summitNehaAttendee.id,
			ticketId: summitNehaTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.ACTIVE,
			code: "VTZ-SUMMIT-NEHA-ACTIVE",
		},
		create: {
			id: seedIds.passes.summitNehaActive,
			eventId: summitEvent.id,
			attendeeId: summitNehaAttendee.id,
			ticketId: summitNehaTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.ACTIVE,
			code: "VTZ-SUMMIT-NEHA-ACTIVE",
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.summitKabirUsed },
		update: {
			eventId: summitEvent.id,
			attendeeId: summitKabirAttendee.id,
			ticketId: summitKabirTicket.id,
			type: PassType.VIP,
			status: PassStatus.USED,
			code: "VTZ-SUMMIT-KABIR-USED",
		},
		create: {
			id: seedIds.passes.summitKabirUsed,
			eventId: summitEvent.id,
			attendeeId: summitKabirAttendee.id,
			ticketId: summitKabirTicket.id,
			type: PassType.VIP,
			status: PassStatus.USED,
			code: "VTZ-SUMMIT-KABIR-USED",
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.summitWalkInCancelled },
		update: {
			eventId: summitEvent.id,
			attendeeId: summitWalkInAttendee.id,
			ticketId: summitWalkInTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.CANCELLED,
			code: "VTZ-SUMMIT-WALKIN-CANCELLED",
		},
		create: {
			id: seedIds.passes.summitWalkInCancelled,
			eventId: summitEvent.id,
			attendeeId: summitWalkInAttendee.id,
			ticketId: summitWalkInTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.CANCELLED,
			code: "VTZ-SUMMIT-WALKIN-CANCELLED",
		},
	});

	await prisma.pass.upsert({
		where: { id: seedIds.passes.meetupAaravUsed },
		update: {
			eventId: meetupEvent.id,
			attendeeId: meetupAaravAttendee.id,
			ticketId: meetupAaravTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.USED,
			code: "VTZ-MEETUP-AARAV-USED",
		},
		create: {
			id: seedIds.passes.meetupAaravUsed,
			eventId: meetupEvent.id,
			attendeeId: meetupAaravAttendee.id,
			ticketId: meetupAaravTicket.id,
			type: PassType.GENERAL,
			status: PassStatus.USED,
			code: "VTZ-MEETUP-AARAV-USED",
		},
	});

	await prisma.checkIn.upsert({
		where: { id: seedIds.checkIns.summitKabir },
		update: {
			attendeeId: summitKabirAttendee.id,
			eventId: summitEvent.id,
			method: CheckInMethod.QR_SCAN,
			timestamp: new Date("2026-05-16T07:10:00.000Z"),
		},
		create: {
			id: seedIds.checkIns.summitKabir,
			attendeeId: summitKabirAttendee.id,
			eventId: summitEvent.id,
			method: CheckInMethod.QR_SCAN,
			timestamp: new Date("2026-05-16T07:10:00.000Z"),
		},
	});

	await prisma.checkIn.upsert({
		where: { id: seedIds.checkIns.meetupAarav },
		update: {
			attendeeId: meetupAaravAttendee.id,
			eventId: meetupEvent.id,
			method: CheckInMethod.MANUAL,
			timestamp: new Date("2026-04-18T12:40:00.000Z"),
		},
		create: {
			id: seedIds.checkIns.meetupAarav,
			attendeeId: meetupAaravAttendee.id,
			eventId: meetupEvent.id,
			method: CheckInMethod.MANUAL,
			timestamp: new Date("2026-04-18T12:40:00.000Z"),
		},
	});

	await syncTierSoldCounts(baseTierIds);

	const summary = await collectDetailedCoverageSummary();

	return {
		adminEmail: adminUser.email,
		primaryEventSlug: summitEvent.slug,
		primaryEventId: summitEvent.id,
		primaryTierId: summitStandardTier.id,
		summary,
	};
}

function logDetailedSeedResult(result: DetailedSeedResult): void {
	console.log(
		`Seed completed successfully. Loaded env from: ${resolvedEnvPath ?? "process environment"}`,
	);
	console.log("Seed coverage:", result.summary);
	console.log(`Admin login email: ${result.adminEmail}`);
	console.log(`Primary event slug: ${result.primaryEventSlug}`);
}

(async () => {
	const seededResult = await seedDetailed();
	logDetailedSeedResult(seededResult);
})()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
