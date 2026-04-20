"use client";

import { ADMIN_NAV_SECTIONS } from "@/shared/config/navigation";
import { AppSidebar } from "@/shared/ui/app-sidebar";

export function AdminSidebar() {
	return <AppSidebar sections={ADMIN_NAV_SECTIONS} />;
}
