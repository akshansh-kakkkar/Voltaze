import {
	Bell,
	ClipboardList,
	Home,
	PlusCircle,
	ShieldCheck,
	Ticket,
	Users,
	Zap,
	User,
	CreditCard,
	Settings,
	BarChart3,
	Heart,
} from "lucide-react";
import type { ReactNode } from "react";

export interface NavItem {
	label: string;
	href: string;
	icon: ReactNode;
}

export interface NavSection {
	title: string;
	items: NavItem[];
}

export const USER_NAV_SECTIONS: NavSection[] = [
	{
		title: "Main menu",
		items: [
			{ label: "Dashboard", href: "/user/dashboard", icon: <Home className="h-5 w-5" /> },
			{ label: "Profile", href: "/user/profile", icon: <User className="h-5 w-5" /> },
		],
	},
	{
		title: "Tickets & Events",
		items: [
			{ label: "My Tickets", href: "/user/tickets", icon: <Ticket className="h-5 w-5" /> },
			{ label: "Liked", href: "/liked-events", icon: <Heart className="h-5 w-5" /> },
		],
	},
	{
		title: "Transactions",
		items: [
			{ label: "Orders", href: "/user/orders", icon: <CreditCard className="h-5 w-5" /> },
			{ label: "Payments", href: "/user/payments", icon: <CreditCard className="h-5 w-5" /> },
		],
	},
	{
		title: "Account",
		items: [
			{ label: "Settings", href: "/user/settings", icon: <Settings className="h-5 w-5" /> },
		],
	},
];

export const HOST_NAV_SECTIONS: NavSection[] = [
	{
		title: "Main menu",
		items: [
			{ label: "Dashboard", href: "/host/dashboard", icon: <Home className="h-5 w-5" /> },
			{ label: "Create Event", href: "/host/events/new", icon: <PlusCircle className="h-5 w-5" /> },
			{ label: "Manage Events", href: "/host/events", icon: <Zap className="h-5 w-5" /> },
		],
	},
	{
		title: "Approvals",
		items: [
			{ label: "My Requests", href: "/host/requests", icon: <Bell className="h-5 w-5" /> },
		],
	},
	{
		title: "Leads",
		items: [
			{ label: "Orders", href: "/host/orders", icon: <ClipboardList className="h-5 w-5" /> },
			{ label: "Attendees", href: "/host/attendees", icon: <Users className="h-5 w-5" /> },
			{ label: "Check-ins", href: "/host/check-ins", icon: <ShieldCheck className="h-5 w-5" /> },
		],
	},
	{
		title: "Insights",
		items: [
			{ label: "Analytics", href: "/host/analytics", icon: <BarChart3 className="h-5 w-5" /> },
		],
	},
	{
		title: "Comms",
		items: [
			{ label: "Settings", href: "/host/settings", icon: <Settings className="h-5 w-5" /> },
		],
	},
];

export const ADMIN_NAV_SECTIONS: NavSection[] = [
	{
		title: "Main menu",
		items: [
			{ label: "Dashboard", href: "/admin/dashboard", icon: <Home className="h-5 w-5" /> },
			{ label: "Create Event", href: "/admin/events/new", icon: <PlusCircle className="h-5 w-5" /> },
			{ label: "Manage Events", href: "/admin/events", icon: <Zap className="h-5 w-5" /> },
		],
	},
	{
		title: "Approvals",
		items: [
			{ label: "Event Approvals", href: "/admin/approvals", icon: <Bell className="h-5 w-5" /> },
		],
	},
	{
		title: "Operations",
		items: [
			{ label: "Orders", href: "/admin/orders", icon: <ClipboardList className="h-5 w-5" /> },
			{ label: "Attendees", href: "/admin/attendees", icon: <Users className="h-5 w-5" /> },
			{ label: "Check-ins", href: "/admin/check-ins", icon: <ShieldCheck className="h-5 w-5" /> },
			{ label: "Tickets", href: "/admin/tickets", icon: <Ticket className="h-5 w-5" /> },
			{ label: "Passes", href: "/admin/passes", icon: <Ticket className="h-5 w-5" /> },
		],
	},
	{
		title: "Admin",
		items: [
			{ label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
			{ label: "Users", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
			{ label: "Payments", href: "/admin/payments", icon: <CreditCard className="h-5 w-5" /> },
			{ label: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
		],
	},
];
