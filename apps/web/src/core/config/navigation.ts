export const navigation = [
	{ href: "/", label: "Home", roles: ["USER", "ADMIN"] },
	{ href: "/events", label: "Events", roles: ["USER", "ADMIN"] },
	{ href: "/tickets", label: "Tickets", roles: ["USER", "ADMIN"] },
	{ href: "/dashboard", label: "Dashboard", roles: ["ADMIN"] },
] as const;

export const managementNavigation = [
	{ href: "/attendees", label: "Attendees", roles: ["ADMIN"] },
	{ href: "/orders", label: "Orders", roles: ["USER", "ADMIN"] },
	{ href: "/passes", label: "Passes", roles: ["USER", "ADMIN"] },
	{ href: "/check-ins", label: "Check-ins", roles: ["ADMIN"] },
	{ href: "/check-ins/scan", label: "Scan QR", roles: ["ADMIN"] },
	{ href: "/payments", label: "Payments", roles: ["ADMIN"] },
	{
		href: "/notifications",
		label: "Notifications",
		roles: ["USER", "ADMIN"],
	},
] as const;

export const modulePillars = [
	"Discover Events",
	"Book Passes",
	"Mobile Tickets",
	"Entry Ready",
] as const;
