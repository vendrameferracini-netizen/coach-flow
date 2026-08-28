import { MessageBoard } from "@/features/messages/message-board";
import { getAppSession } from "@/lib/auth/session";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoMessages } from "@/lib/data/demo";

export default async function MessagesPage() {
  const { profile } = await getAppSession(["coach", "student"]);
  const student = getDemoStudentForProfile(profile);
  const messages = profile.role === "student"
    ? demoMessages.filter((item) => item.studentId === student?.id)
    : demoMessages.filter((item) => item.coachId === getDemoCoachId(profile));
  return <MessageBoard messages={messages} readOnly={profile.role === "student"} />;
}
