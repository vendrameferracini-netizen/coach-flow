import { DietBoard } from "@/features/nutrition/diet-board";
import { getAppSession } from "@/lib/auth/session";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoDiets } from "@/lib/data/demo";

export default async function DietsPage() {
  const { profile } = await getAppSession(["coach", "student"]);
  const student = getDemoStudentForProfile(profile);
  const diets = profile.role === "student"
    ? demoDiets.filter((item) => item.studentId === student?.id)
    : demoDiets.filter((item) => item.coachId === getDemoCoachId(profile));
  return <DietBoard diets={diets} readOnly={profile.role === "student"} />;
}
