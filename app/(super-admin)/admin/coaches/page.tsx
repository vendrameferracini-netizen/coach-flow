import { CoachManagement } from "@/features/admin/coach-management";
import { getAppSession } from "@/lib/auth/session";
import { getRealCoachProfiles } from "@/lib/dashboard/supabase-dashboard";
import { demoProfiles } from "@/lib/data/demo";

export default async function CoachesPage() {
  const { isDemo } = await getAppSession(["super_admin"]);
  if (!isDemo) return <CoachManagement coaches={await getRealCoachProfiles()} />;
  return <CoachManagement coaches={demoProfiles.filter((profile) => profile.role === "coach")} />;
}
