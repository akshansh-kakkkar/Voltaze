import type { Route } from "next";
import { redirect } from "next/navigation";

export default function HostAnalyticsPage() {
	// Analytics are displayed inside the dashboard (no dedicated analytics route).
	redirect("/host/dashboard" as Route);
}
