import { createClient } from "@/lib/supabase/server";
import { getTrainingWorkspace } from "@/lib/training/supabase-workouts";
import type {
  AlertType,
  Assessment,
  Diet,
  HormonalProtocol,
  Message,
  Profile,
  SmartAlert,
  Student
} from "@/types/domain";

type AnyRow = Record<string, any>;

function mapProfile(row: AnyRow): Profile {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || undefined,
    cpf: row.cpf || undefined,
    status: row.status,
    plan: row.plan || undefined,
    coachId: row.coach_id || undefined,
    createdAt: row.created_at,
    notes: row.notes || undefined
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

function mapDiet(row: AnyRow): Diet {
  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    name: row.name,
    startsAt: row.starts_at,
    expiresAt: row.expires_at || "",
    meals: (row.diet_meals || []).map((meal: AnyRow) => ({
      id: meal.id,
      name: meal.name,
      time: meal.time || "",
      foods: meal.foods,
      amount: meal.amount || "",
      substitutions: meal.substitutions || undefined,
      notes: meal.notes || undefined
    }))
  };
}

function mapAssessment(row: AnyRow): Assessment {
  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    assessedAt: row.assessed_at,
    weight: Number(row.weight || 0),
    height: Number(row.height || 0),
    bodyFat: Number(row.body_fat || 0),
    leanMass: Number(row.lean_mass || 0),
    circumferences: row.circumferences || {},
    photoUrls: (row.assessment_photos || []).map((photo: AnyRow) => photo.storage_path),
    notes: row.notes || undefined
  };
}

function mapProtocol(row: AnyRow): HormonalProtocol {
  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    medicine: row.medicine,
    dosage: row.dosage || "",
    days: row.days || "",
    time: row.time || "",
    startsAt: row.starts_at || "",
    endsAt: row.ends_at || undefined,
    notes: row.notes || undefined
  };
}

function mapMessage(row: AnyRow): Message {
  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    title: row.title,
    body: row.body,
    sentAt: row.sent_at,
    readAt: row.read_at || undefined
  };
}

function mapAlert(row: AnyRow): SmartAlert {
  const due = new Date(`${row.due_at}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    studentName: row.students?.name || "Aluno",
    type: row.type as AlertType,
    dueAt: row.due_at,
    daysRemaining: Math.ceil((due.getTime() - today.getTime()) / 86400000),
    status: row.status
  };
}

export type CoachDashboardData = {
  coach: Profile;
  students: Student[];
  workouts: { id: string; active: boolean }[];
  diets: Diet[];
  assessments: Assessment[];
  protocols: HormonalProtocol[];
  messages: Message[];
  alerts: SmartAlert[];
};

export async function getRealSuperAdminDashboard() {
  const supabase = await createClient() as any;
  const [{ data: coaches, error: coachesError }, { data: students, error: studentsError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "coach").order("created_at", { ascending: false }),
    supabase.from("students").select("*").order("joined_at", { ascending: false })
  ]);

  if (coachesError) throw coachesError;
  if (studentsError) throw studentsError;

  return {
    coaches: ((coaches || []) as AnyRow[]).map(mapProfile),
    students: ((students || []) as AnyRow[]).map(mapStudent)
  };
}

export async function getRealCoachDashboard(profile: Profile): Promise<CoachDashboardData> {
  const supabase = await createClient() as any;
  const [{ data: students, error: studentsError }, { data: workouts, error: workoutsError }, { data: diets, error: dietsError }, { data: assessments, error: assessmentsError }, { data: protocols, error: protocolsError }, { data: messages, error: messagesError }, { data: alerts, error: alertsError }] = await Promise.all([
    supabase.from("students").select("*").eq("coach_id", profile.id).order("name"),
    supabase.from("workouts").select("id, active").eq("coach_id", profile.id),
    supabase.from("diets").select("*, diet_meals (*)").eq("coach_id", profile.id),
    supabase.from("assessments").select("*, assessment_photos (*)").eq("coach_id", profile.id),
    supabase.from("hormonal_protocols").select("*").eq("coach_id", profile.id),
    supabase.from("messages").select("*").eq("coach_id", profile.id).order("sent_at", { ascending: false }),
    supabase.from("smart_alerts").select("*, students (name)").eq("coach_id", profile.id).eq("status", "pending").order("due_at")
  ]);

  const error = studentsError || workoutsError || dietsError || assessmentsError || protocolsError || messagesError || alertsError;
  if (error) throw error;

  return {
    coach: profile,
    students: ((students || []) as AnyRow[]).map(mapStudent),
    workouts: ((workouts || []) as AnyRow[]).map((workout) => ({ id: workout.id, active: Boolean(workout.active) })),
    diets: ((diets || []) as AnyRow[]).map(mapDiet),
    assessments: ((assessments || []) as AnyRow[]).map(mapAssessment),
    protocols: ((protocols || []) as AnyRow[]).map(mapProtocol),
    messages: ((messages || []) as AnyRow[]).map(mapMessage),
    alerts: ((alerts || []) as AnyRow[]).map(mapAlert)
  };
}

export async function getRealStudentDashboard(profile: Profile) {
  const supabase = await createClient() as any;
  const training = await getTrainingWorkspace(profile);
  const student = training.students[0];

  if (!student) {
    return { student: null, workouts: [], diets: [], assessments: [], protocols: [], messages: [] };
  }

  const [{ data: diets, error: dietsError }, { data: assessments, error: assessmentsError }, { data: protocols, error: protocolsError }, { data: messages, error: messagesError }] = await Promise.all([
    supabase.from("diets").select("*, diet_meals (*)").eq("student_id", student.id).order("created_at", { ascending: false }),
    supabase.from("assessments").select("*, assessment_photos (*)").eq("student_id", student.id).order("assessed_at", { ascending: false }),
    supabase.from("hormonal_protocols").select("*").eq("student_id", student.id).order("created_at", { ascending: false }),
    supabase.from("messages").select("*").eq("student_id", student.id).order("sent_at", { ascending: false })
  ]);

  const error = dietsError || assessmentsError || protocolsError || messagesError;
  if (error) throw error;

  return {
    student,
    workouts: training.workouts,
    diets: ((diets || []) as AnyRow[]).map(mapDiet),
    assessments: ((assessments || []) as AnyRow[]).map(mapAssessment),
    protocols: ((protocols || []) as AnyRow[]).map(mapProtocol),
    messages: ((messages || []) as AnyRow[]).map(mapMessage)
  };
}
