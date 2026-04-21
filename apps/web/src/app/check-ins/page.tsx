import { CheckInsView } from "@/modules/check-ins"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function CheckInsPage() {
	return <ProtectedRoute><CheckInsView /></ProtectedRoute>;
}
