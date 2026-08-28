import { createClient } from "@/lib/supabase/server";
import type { ExerciseLibraryItem, Profile, Student, Workout, WorkoutExercise, WorkoutExerciseLog } from "@/types/domain";

type AnyRow = Record<string, any>;

function mapExercise(row: AnyRow): ExerciseLibraryItem {
  return {
    id: row.id,
    coachId: row.coach_id || undefined,
    name: row.name,
    muscleGroup: row.muscle_group,
    muscleSubgroup: row.muscle_subgroup || undefined,
    category: row.category || undefined,
    equipment: row.equipment || undefined,
    difficulty: row.difficulty,
    coverUrl: row.cover_url || undefined,
    videoUrl: row.video_url || undefined,
    description: row.description || undefined,
    executionSteps: row.execution_steps || [],
    executionTips: row.execution_tips || [],
    commonMistakes: row.common_mistakes || [],
    notes: row.notes || undefined,
    status: row.status
  };
}

function mapStudent(row: AnyRow): Student {
  return {
    id: row.id,
    coachId: row.coach_id,
    authUserId: row.auth_user_id || undefined,
    name: row.name,
    phone: row.phone || "",
    email: row.email,
    birthDate: row.birth_date || "",
    sex: row.sex || "outro",
    weight: Number(row.weight || 0),
    height: Number(row.height || 0),
    goal: row.goal || "",
    level: row.level,
    status: row.status,
    notes: row.notes || undefined,
    joinedAt: row.joined_at,
    photoUrl: row.photo_url || undefined,
    dietFrequencyDays: row.diet_frequency_days,
    workoutFrequencyDays: row.workout_frequency_days,
    protocolFrequencyDays: row.protocol_frequency_days
  };
}

function mapLog(row: AnyRow): WorkoutExerciseLog {
  return {
    id: row.id,
    workoutExerciseId: row.workout_exercise_id,
    workoutId: row.workout_id,
    studentId: row.student_id,
    coachId: row.coach_id,
    performedAt: row.performed_at,
    setNumber: row.set_number || undefined,
    status: row.status,
    loadUsed: row.load_used || undefined,
    repetitionsDone: row.repetitions_done || undefined,
    effortPerception: row.effort_perception || undefined,
    difficulty: row.difficulty || undefined,
    notes: row.notes || undefined
  };
}

function mapWorkoutExercise(row: AnyRow): WorkoutExercise {
  const exerciseRow = row.exercise || row.exercise_library;
  const exercise = exerciseRow ? mapExercise(exerciseRow) : undefined;
  const logs = (row.workout_exercise_logs || [])
    .map(mapLog)
    .sort((a: WorkoutExerciseLog, b: WorkoutExerciseLog) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());

  return {
    id: row.id,
    exerciseId: row.exercise_id || undefined,
    exercise,
    weekday: row.weekday,
    name: exercise?.name || row.prescription_title || row.name,
    muscleGroup: exercise?.muscleGroup || row.muscle_group || "",
    sets: row.sets || "",
    reps: row.repetitions || "",
    load: row.load || undefined,
    rest: row.rest || undefined,
    targetTime: row.target_time || undefined,
    targetDistance: row.target_distance || undefined,
    rpe: row.rpe || undefined,
    rir: row.rir || undefined,
    method: row.method || undefined,
    coachNotes: row.coach_notes || undefined,
    alternativeExerciseId: row.alternative_exercise_id || undefined,
    status: row.status || "pending",
    notes: row.notes || undefined,
    logs
  };
}

function mapWorkout(row: AnyRow): Workout {
  const exercises = (row.workout_exercises || [])
    .map(mapWorkoutExercise)
    .sort((a: WorkoutExercise, b: WorkoutExercise) => {
      if (a.weekday === b.weekday) return 0;
      return a.weekday.localeCompare(b.weekday);
    });

  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    name: row.name,
    goal: row.goal || undefined,
    startsAt: row.starts_at,
    expiresAt: row.expires_at || "",
    active: row.active,
    exercises
  };
}

export type TrainingWorkspaceData = {
  students: Student[];
  exercises: ExerciseLibraryItem[];
  workouts: Workout[];
};

export async function getTrainingWorkspace(profile: Profile): Promise<TrainingWorkspaceData> {
  const supabase = await createClient() as any;

  const studentsQuery = profile.role === "student"
    ? supabase.from("students").select("*").eq("auth_user_id", profile.id)
    : supabase.from("students").select("*").eq("coach_id", profile.id).order("name");

  const [{ data: studentsData, error: studentsError }, { data: exercisesData, error: exercisesError }] = await Promise.all([
    studentsQuery,
    supabase
      .from("exercise_library")
      .select("*")
      .order("name")
  ]);

  if (studentsError) throw studentsError;
  if (exercisesError) throw exercisesError;

  const students: Student[] = ((studentsData || []) as AnyRow[]).map(mapStudent);
  const studentIds = students.map((student) => student.id);

  if (!studentIds.length) {
    return {
      students,
      exercises: ((exercisesData || []) as AnyRow[]).map(mapExercise),
      workouts: []
    };
  }

  const workoutsQuery = supabase
    .from("workouts")
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercise_library!workout_exercises_exercise_id_fkey (*),
        workout_exercise_logs (*)
      )
    `)
    .in("student_id", studentIds)
    .eq("active", true)
    .order("created_at", { ascending: false });

  const { data: workoutsData, error: workoutsError } = await workoutsQuery;
  if (workoutsError) throw workoutsError;

  return {
    students,
    exercises: ((exercisesData || []) as AnyRow[]).map(mapExercise),
    workouts: ((workoutsData || []) as AnyRow[]).map(mapWorkout)
  };
}
