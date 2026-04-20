"use client";

import { HOST_NAV_SECTIONS } from "@/shared/config/navigation";
import { AppSidebar } from "@/shared/ui/app-sidebar";

export function HostSidebar() {
	return <AppSidebar sections={HOST_NAV_SECTIONS} />;
}
