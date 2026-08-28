import { AssessmentBoard } from "@/features/assessments/assessment-board";
import { getAppSession } from "@/lib/auth/session";
import { getRealAssessmentsForProfile } from "@/lib/dashboard/supabase-dashboard";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoAssessments, demoStudents } from "@/lib/data/demo";

export default async function AssessmentsPage() {
  const { profile, isDemo } = await getAppSession(["coach", "student"]);
  if (!isDemo) {
    const data = await getRealAssessmentsForProfile(profile);
    return <AssessmentBoard assessments={data.assessments} students={data.students} readOnly={profile.role === "student"} />;
  }

  const student = getDemoStudentForProfile(profile);
  const assessments = profile.role === "student"
    ? demoAssessments.filter((item) => item.studentId === student?.id)
    : demoAssessments.filter((item) => item.coachId === getDemoCoachId(profile));
  const students = profile.role === "student" && student ? [student] : demoStudents.filter((item) => item.coachId === getDemoCoachId(profile));
  return <AssessmentBoard assessments={assessments} students={students} readOnly={profile.role === "student"} />;
}
