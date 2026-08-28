import { CoachManagement } from "@/features/admin/coach-management";
import { getAppSession } from "@/lib/auth/session";
import { demoProfiles } from "@/lib/data/demo";

export default async function CoachesPage() {
  await getAppSession(["super_admin"]);
  return <CoachManagement coaches={demoProfiles.filter((profile) => profile.role === "coach")} />;
}
