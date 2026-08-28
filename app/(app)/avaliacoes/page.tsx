import { AssessmentBoard } from "@/features/assessments/assessment-board";
import { getAppSession } from "@/lib/auth/session";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoAssessments } from "@/lib/data/demo";

export default async function AssessmentsPage() {
  const { profile } = await getAppSession(["coach", "student"]);
  const student = getDemoStudentForProfile(profile);
  const assessments = profile.role === "student"
    ? demoAssessments.filter((item) => item.studentId === student?.id)
    : demoAssessments.filter((item) => item.coachId === getDemoCoachId(profile));
  return <AssessmentBoard assessments={assessments} readOnly={profile.role === "student"} />;
}
