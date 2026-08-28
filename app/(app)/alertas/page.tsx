import { AlertsBoard } from "@/features/dashboard/alerts-board";
import { getAppSession } from "@/lib/auth/session";
import { getDemoCoachId } from "@/lib/data/demo-context";
import { demoAlerts } from "@/lib/data/demo";

export default async function AlertsPage() {
  const { profile } = await getAppSession(["coach"]);
  return <AlertsBoard alerts={demoAlerts.filter((alert) => alert.coachId === getDemoCoachId(profile))} />;
}
