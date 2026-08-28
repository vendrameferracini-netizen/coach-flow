import { StudentList } from "@/features/students/student-list";
import { getAppSession } from "@/lib/auth/session";
import { getRealStudentsForCoach } from "@/lib/dashboard/supabase-dashboard";
import { getDemoCoachId } from "@/lib/data/demo-context";
import { demoStudents } from "@/lib/data/demo";

export default async function StudentsPage() {
  const { profile, isDemo } = await getAppSession(["coach"]);
  if (!isDemo) return <StudentList students={await getRealStudentsForCoach(profile)} />;
  return <StudentList students={demoStudents.filter((student) => student.coachId === getDemoCoachId(profile))} />;
}
