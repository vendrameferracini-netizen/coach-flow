import { WorkoutBoard } from "@/features/training/workout-board";
import { getAppSession } from "@/lib/auth/session";
import { getDemoCoachId, getDemoStudentForProfile } from "@/lib/data/demo-context";
import { demoExercises, demoWorkouts } from "@/lib/data/demo";
import { getTrainingWorkspace } from "@/lib/training/supabase-workouts";

export default async function WorkoutsPage() {
  const { profile, isDemo } = await getAppSession(["coach", "student"]);

  if (!isDemo) {
    const data = await getTrainingWorkspace(profile);
    return (
      <WorkoutBoard
        profileId={profile.id}
        role={profile.role}
        students={data.students}
        workouts={data.workouts}
        exercises={data.exercises}
        readOnly={profile.role === "student"}
      />
    );
  }

  const student = getDemoStudentForProfile(profile);
  const workouts = profile.role === "student"
    ? demoWorkouts.filter((item) => item.studentId === student?.id)
    : demoWorkouts.filter((item) => item.coachId === getDemoCoachId(profile));
  return (
    <WorkoutBoard
      profileId={profile.id}
      role={profile.role}
      students={student ? [student] : []}
      workouts={workouts}
      exercises={demoExercises}
      readOnly={profile.role === "student"}
      demoMode
    />
  );
}
