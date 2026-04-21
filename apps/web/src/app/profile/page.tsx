import { ProfileView } from "@/modules/auth"; 
import { ProtectedRoute } from "@/core/components/protected-route";

export default function ProfilePage() {
	return <ProtectedRoute><ProfileView /></ProtectedRoute>;
}
