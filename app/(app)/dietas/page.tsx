import { DietBoard } from "@/features/nutrition/diet-board";
import { getAppSession } from "@/lib/auth/session";
import { getRealDietsForProfile } from "@/lib/dashboard/supabase-dashboard";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoDiets, demoStudents } from "@/lib/data/demo";

export default async function DietsPage() {
  const { profile, isDemo } = await getAppSession(["coach", "student"]);
  if (!isDemo) {
    const data = await getRealDietsForProfile(profile);
    return <DietBoard diets={data.diets} students={data.students} readOnly={profile.role === "student"} />;
  }

  const student = getDemoStudentForProfile(profile);
  const diets = profile.role === "student"
    ? demoDiets.filter((item) => item.studentId === student?.id)
    : demoDiets.filter((item) => item.coachId === getDemoCoachId(profile));
  const students = profile.role === "student" && student ? [student] : demoStudents.filter((item) => item.coachId === getDemoCoachId(profile));
  return <DietBoard diets={diets} students={students} readOnly={profile.role === "student"} />;
}
