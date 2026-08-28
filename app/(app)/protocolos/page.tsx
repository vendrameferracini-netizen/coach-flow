import { ProtocolBoard } from "@/features/protocols/protocol-board";
import { getAppSession } from "@/lib/auth/session";
import { getRealProtocolsForProfile } from "@/lib/dashboard/supabase-dashboard";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoProtocols, demoStudents } from "@/lib/data/demo";

export default async function ProtocolsPage() {
  const { profile, isDemo } = await getAppSession(["coach", "student"]);
  if (!isDemo) {
    const data = await getRealProtocolsForProfile(profile);
    return <ProtocolBoard protocols={data.protocols} students={data.students} readOnly={profile.role === "student"} />;
  }

  const student = getDemoStudentForProfile(profile);
  const protocols = profile.role === "student"
    ? demoProtocols.filter((item) => item.studentId === student?.id)
    : demoProtocols.filter((item) => item.coachId === getDemoCoachId(profile));
  const students = profile.role === "student" && student ? [student] : demoStudents.filter((item) => item.coachId === getDemoCoachId(profile));
  return <ProtocolBoard protocols={protocols} students={students} readOnly={profile.role === "student"} />;
}
