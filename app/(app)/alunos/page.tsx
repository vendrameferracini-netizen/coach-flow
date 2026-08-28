import { StudentList } from "@/features/students/student-list";
import { getAppSession } from "@/lib/auth/session";
import { getDemoCoachId } from "@/lib/data/demo-context";
import { demoStudents } from "@/lib/data/demo";

export default async function StudentsPage() {
  const { profile } = await getAppSession(["coach"]);
  return <StudentList students={demoStudents.filter((student) => student.coachId === getDemoCoachId(profile))} />;
}
