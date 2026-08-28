import { ProtocolBoard } from "@/features/protocols/protocol-board";
import { getAppSession } from "@/lib/auth/session";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoProtocols } from "@/lib/data/demo";

export default async function ProtocolsPage() {
  const { profile } = await getAppSession(["coach", "student"]);
  const student = getDemoStudentForProfile(profile);
  const protocols = profile.role === "student"
    ? demoProtocols.filter((item) => item.studentId === student?.id)
    : demoProtocols.filter((item) => item.coachId === getDemoCoachId(profile));
  return <ProtocolBoard protocols={protocols} readOnly={profile.role === "student"} />;
}
