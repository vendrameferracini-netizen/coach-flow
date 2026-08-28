import { AlertsBoard } from "@/features/dashboard/alerts-board";
import { getAppSession } from "@/lib/auth/session";
import { getRealAlertsForCoach } from "@/lib/dashboard/supabase-dashboard";
import { getDemoCoachId } from "@/lib/data/demo-context";
import { demoAlerts } from "@/lib/data/demo";

export default async function AlertsPage() {
  const { profile, isDemo } = await getAppSession(["coach"]);
  if (!isDemo) return <AlertsBoard alerts={await getRealAlertsForCoach(profile)} />;
  return <AlertsBoard alerts={demoAlerts.filter((alert) => alert.coachId === getDemoCoachId(profile))} />;
}
