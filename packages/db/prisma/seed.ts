import {
	EventMode,
	EventStatus,
	EventType,
	EventVisibility,
	OrderStatus,
	PassStatus,
	PaymentGateway,
	PaymentStatus,
	UserRole,
} from "../prisma/generated/client";
import { prisma } from "../src/index";

async function main() {
	console.log("🌱 Starting seeding...");

	// 1. Clean existing data (order matters due to relations)
	console.log("Cleaning database...");
	await prisma.notification.deleteMany();
	await prisma.payment.deleteMany();
	await prisma.pass.deleteMany();
	await prisma.checkIn.deleteMany();
	await prisma.ticket.deleteMany();
	await prisma.order.deleteMany();
	await prisma.attendee.deleteMany();
	await prisma.ticketTier.deleteMany();
	await prisma.event.deleteMany();
	await prisma.session.deleteMany();
	await prisma.account.deleteMany();
	await prisma.user.deleteMany();

	// 2. Create Users
	console.log("Creating users...");
	const admin = await prisma.user.create({
		data: {
			name: "Platform Admin",
			email: "admin@univents.com",
			role: UserRole.ADMIN,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
		},
	});

	const host = await prisma.user.create({
		data: {
			name: "Nayan Biswas",
			email: "nayan@univents.com",
			role: UserRole.USER,
			isHost: true,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=nayan",
		},
	});

	const attendeeUser = await prisma.user.create({
		data: {
			name: "John Doe",
			email: "john@example.com",
			role: UserRole.USER,
			emailVerified: true,
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
		},
	});

	// 2.5 Create Accounts for Users (with password123)
	console.log("Creating accounts with passwords...");

	// BetterAuth compatible password hashing (scrypt)
	const scryptConfig = {
		N: 16384,
		r: 16,
		p: 1,
		dkLen: 64,
	};

	const hashPassword = async (password: string) => {
		const { scrypt, randomBytes } = await import("node:crypto");
		const salt = randomBytes(16).toString("hex");
		return new Promise<string>((resolve, reject) => {
			scrypt(
				password.normalize("NFKC"),
				salt,
				scryptConfig.dkLen,
				{
					N: scryptConfig.N,
					r: scryptConfig.r,
					p: scryptConfig.p,
					maxmem: 128 * scryptConfig.N * scryptConfig.r * 2,
				},
				(err, key) => {
					if (err) reject(err);
					else resolve(`${salt}:${key.toString("hex")}`);
				},
			);
		});
	};

	const hashedPassword = await hashPassword("password123");

	const users = [
		{ id: admin.id, email: admin.email },
		{ id: host.id, email: host.email },
		{ id: attendeeUser.id, email: attendeeUser.email },
	];

	for (const user of users) {
		await prisma.account.create({
			data: {
				userId: user.id,
				accountId: user.email,
				providerId: "credential",
				password: hashedPassword,
			},
		});
	}

	// 3. Create Events
	console.log("Creating events...");
	const event1 = await prisma.event.create({
		data: {
			name: "Global Tech Summit 2026",
			slug: "global-tech-summit-2026",
			userId: host.id,
			coverUrl:
				"https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=400",
			description:
				"Join industry leaders for the most influential tech event of the year. Deep dives into AI, Quantum Computing, and the future of the Web.",
			venueName: "Convention Center",
			address: "123 Tech Park, Bangalore, India",
			latitude: "12.9716",
			longitude: "77.5946",
			startDate: new Date("2026-06-15T09:00:00Z"),
			endDate: new Date("2026-06-17T18:00:00Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			timezone: "Asia/Kolkata",
		},
	});

	const event2 = await prisma.event.create({
		data: {
			name: "Neon Nights Music Festival",
			slug: "neon-nights-2026",
			userId: host.id,
			coverUrl:
				"https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=400",
			description:
				"An immersive music experience featuring the best electronic and synthwave artists from across the globe.",
			venueName: "Open Air Stadium",
			address: "Marine Drive, Mumbai, India",
			latitude: "18.9431",
			longitude: "72.8230",
			startDate: new Date("2026-07-20T17:00:00Z"),
			endDate: new Date("2026-07-21T02:00:00Z"),
			type: EventType.PAID,
			mode: EventMode.OFFLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			timezone: "Asia/Kolkata",
		},
	});

	const event3 = await prisma.event.create({
		data: {
			name: "Mastering Prisma Workshop",
			slug: "mastering-prisma-2026",
			userId: admin.id,
			coverUrl:
				"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
			thumbnail:
				"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400",
			description:
				"A comprehensive online workshop to master database modeling and type-safe queries with Prisma.",
			startDate: new Date("2026-05-10T14:00:00Z"),
			endDate: new Date("2026-05-10T17:00:00Z"),
			type: EventType.FREE,
			mode: EventMode.ONLINE,
			visibility: EventVisibility.PUBLIC,
			status: EventStatus.PUBLISHED,
			timezone: "UTC",
		},
	});

	// 4. Create Ticket Tiers
	console.log("Creating ticket tiers...");
	const tiers1 = await Promise.all([
		prisma.ticketTier.create({
			data: {
				eventId: event1.id,
				name: "General Admission",
				description: "Full access to all keynote sessions and exhibition area.",
				price: 2999,
				quantity: 500,
			},
		}),
		prisma.ticketTier.create({
			data: {
				eventId: event1.id,
				name: "VIP Pass",
				description:
					"Priority seating, exclusive lounge access, and dinner with speakers.",
				price: 7999,
				quantity: 50,
			},
		}),
	]);

	const tiers2 = await Promise.all([
		prisma.ticketTier.create({
			data: {
				eventId: event2.id,
				name: "Early Bird",
				description: "Discounted entry for early supporters.",
				price: 999,
				quantity: 200,
			},
		}),
		prisma.ticketTier.create({
			data: {
				eventId: event2.id,
				name: "Regular Entry",
				description: "Standard entry pass.",
				price: 1999,
				quantity: 1000,
			},
		}),
	]);

	const _freeTier = await prisma.ticketTier.create({
		data: {
			eventId: event3.id,
			name: "Free Registration",
			description: "Join the live stream and get access to recording.",
			price: 0,
			quantity: 5000,
		},
	});

	// 5. Create some dummy attendees and orders
	console.log("Creating dummy orders...");

	// Attendee for Event 1
	const attendee1 = await prisma.attendee.create({
		data: {
			userId: attendeeUser.id,
			eventId: event1.id,
			name: attendeeUser.name ?? "Anonymous Attendee",
			email: attendeeUser.email,
			phone: "9876543210",
		},
	});

	const order1 = await prisma.order.create({
		data: {
			attendeeId: attendee1.id,
			eventId: event1.id,
			status: OrderStatus.COMPLETED,
			totalAmount: tiers1[0].price,
		},
	});

	const ticket1 = await prisma.ticket.create({
		data: {
			orderId: order1.id,
			eventId: event1.id,
			tierId: tiers1[0].id,
			pricePaid: tiers1[0].price,
		},
	});

	await prisma.pass.create({
		data: {
			eventId: event1.id,
			attendeeId: attendee1.id,
			ticketId: ticket1.id,
			code: "UE-CONF-001-XYZ",
			status: PassStatus.ACTIVE,
		},
	});

	await prisma.payment.create({
		data: {
			orderId: order1.id,
			amount: tiers1[0].price * 100, // in paise
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "pay_123456789",
			status: PaymentStatus.SUCCESS,
		},
	});

	// Guest attendee for Event 2
	const attendee2 = await prisma.attendee.create({
		data: {
			eventId: event2.id,
			name: "Jane Smith",
			email: "jane@example.com",
		},
	});

	const order2 = await prisma.order.create({
		data: {
			attendeeId: attendee2.id,
			eventId: event2.id,
			status: OrderStatus.COMPLETED,
			totalAmount: tiers2[0].price,
		},
	});

	const ticket2 = await prisma.ticket.create({
		data: {
			orderId: order2.id,
			eventId: event2.id,
			tierId: tiers2[0].id,
			pricePaid: tiers2[0].price,
		},
	});

	await prisma.pass.create({
		data: {
			eventId: event2.id,
			attendeeId: attendee2.id,
			ticketId: ticket2.id,
			code: "UE-MUSIC-001-ABC",
			status: PassStatus.ACTIVE,
		},
	});

	await prisma.payment.create({
		data: {
			orderId: order2.id,
			amount: tiers2[0].price * 100,
			gateway: PaymentGateway.RAZORPAY,
			transactionId: "pay_987654321",
			status: PaymentStatus.SUCCESS,
		},
	});

	// Update sold counts
	await prisma.ticketTier.update({
		where: { id: tiers1[0].id },
		data: { soldCount: 1 },
	});
	await prisma.ticketTier.update({
		where: { id: tiers2[0].id },
		data: { soldCount: 1 },
	});

	// 6. Create some notifications
	console.log("Creating notifications...");
	await prisma.notification.createMany({
		data: [
			{
				userId: host.id,
				type: "EVENT_CREATED",
				title: "Event Published",
				message: "Your event 'Global Tech Summit 2026' is now live!",
				status: "UNREAD",
			},
			{
				userId: attendeeUser.id,
				type: "ORDER_CONFIRMED",
				title: "Ticket Confirmed",
				message: "Your ticket for Global Tech Summit 2026 has been issued.",
				status: "UNREAD",
				orderId: order1.id,
			},
			{
				userId: host.id,
				type: "PAYMENT_SUCCESS",
				title: "New Ticket Sold",
				message:
					"Someone just bought a General Admission ticket for Global Tech Summit 2026.",
				status: "UNREAD",
			},
		],
	});

	console.log("✅ Seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Seeding failed:");
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
