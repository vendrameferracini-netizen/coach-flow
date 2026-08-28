import { MessageBoard } from "@/features/messages/message-board";
import { getAppSession } from "@/lib/auth/session";
import { getRealMessagesForProfile } from "@/lib/dashboard/supabase-dashboard";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoMessages, demoStudents } from "@/lib/data/demo";

export default async function MessagesPage() {
  const { profile, isDemo } = await getAppSession(["coach", "student"]);
  if (!isDemo) {
    const data = await getRealMessagesForProfile(profile);
    return <MessageBoard messages={data.messages} students={data.students} readOnly={profile.role === "student"} />;
  }

  const student = getDemoStudentForProfile(profile);
  const messages = profile.role === "student"
    ? demoMessages.filter((item) => item.studentId === student?.id)
    : demoMessages.filter((item) => item.coachId === getDemoCoachId(profile));
  const students = profile.role === "student" && student ? [student] : demoStudents.filter((item) => item.coachId === getDemoCoachId(profile));
  return <MessageBoard messages={messages} students={students} readOnly={profile.role === "student"} />;
}
