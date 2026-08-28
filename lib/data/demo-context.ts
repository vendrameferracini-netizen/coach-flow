import { demoStudents } from "@/lib/data/demo";
import type { Profile } from "@/types/domain";

export function getDemoCoachId(profile: Profile) {
  if (profile.email === "coach@coachflow.com") return "coach-1";
  return profile.id;
}

export function getDemoStudentForProfile(profile: Profile) {
  return (
    demoStudents.find((student) => student.email === profile.email) ||
    demoStudents.find((student) => student.authUserId === profile.id) ||
    demoStudents[0]
  );
}
