export type UserRole = "super_admin" | "coach" | "student";
export type RecordStatus = "active" | "inactive" | "blocked";
export type StudentLevel = "iniciante" | "intermediario" | "avancado";
export type ExerciseDifficulty = "iniciante" | "intermediario" | "avancado";
export type ExerciseFeedbackLevel = "facil" | "ideal" | "dificil";
export type SetCompletionStatus = "pending" | "completed" | "skipped";

export type Profile = {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  cpf?: string;
  status: RecordStatus;
  plan?: string;
  coachId?: string;
  createdAt: string;
  notes?: string;
};

export type Student = {
  id: string;
  coachId: string;
  authUserId?: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  sex: "feminino" | "masculino" | "outro";
  weight: number;
  height: number;
  goal: string;
  level: StudentLevel;
  status: RecordStatus;
  notes?: string;
  joinedAt: string;
  photoUrl?: string;
  dietFrequencyDays: number;
  workoutFrequencyDays: number;
  protocolFrequencyDays: number;
};

export type ExerciseLibraryItem = {
  id: string;
  coachId?: string;
  name: string;
  muscleGroup: string;
  muscleSubgroup?: string;
  category?: string;
  equipment?: string;
  difficulty: ExerciseDifficulty;
  coverUrl?: string;
  videoUrl?: string;
  description?: string;
  executionSteps: string[];
  executionTips: string[];
  commonMistakes: string[];
  notes?: string;
  alternativeIds?: string[];
  status: RecordStatus;
};

export type WorkoutExerciseLog = {
  id: string;
  workoutExerciseId: string;
  workoutId: string;
  studentId: string;
  coachId: string;
  performedAt: string;
  setNumber?: number;
  status: SetCompletionStatus;
  loadUsed?: string;
  repetitionsDone?: string;
  effortPerception?: number;
  difficulty?: ExerciseFeedbackLevel;
  notes?: string;
};

export type WorkoutExercise = {
  id: string;
  exerciseId?: string;
  exercise?: ExerciseLibraryItem;
  weekday: Weekday;
  name: string;
  muscleGroup: string;
  sets: string;
  reps: string;
  load?: string;
  rest?: string;
  targetTime?: string;
  targetDistance?: string;
  rpe?: string;
  rir?: string;
  method?: string;
  coachNotes?: string;
  alternativeExerciseId?: string;
  status?: SetCompletionStatus;
  notes?: string;
  logs?: WorkoutExerciseLog[];
};

export type Workout = {
  id: string;
  coachId: string;
  studentId: string;
  name: string;
  goal?: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
  exercises: WorkoutExercise[];
};

export type WorkoutFeedback = {
  id: string;
  workoutId: string;
  studentId: string;
  coachId: string;
  feedback: ExerciseFeedbackLevel;
  notes?: string;
  createdAt: string;
};

export type DietMeal = {
  id: string;
  name: string;
  time: string;
  foods: string;
  amount: string;
  substitutions?: string;
  notes?: string;
};

export type Diet = {
  id: string;
  coachId: string;
  studentId: string;
  name: string;
  startsAt: string;
  expiresAt: string;
  meals: DietMeal[];
};

export type Assessment = {
  id: string;
  coachId: string;
  studentId: string;
  assessedAt: string;
  weight: number;
  height: number;
  bodyFat: number;
  leanMass: number;
  circumferences: Record<string, number>;
  photoUrls: string[];
  notes?: string;
};

export type HormonalProtocol = {
  id: string;
  coachId: string;
  studentId: string;
  medicine: string;
  dosage: string;
  days: string;
  time: string;
  startsAt: string;
  endsAt?: string;
  notes?: string;
};

export type Message = {
  id: string;
  coachId: string;
  studentId: string;
  title: string;
  body: string;
  sentAt: string;
  readAt?: string;
};

export type AlertType = "diet" | "workout" | "assessment" | "protocol";

export type SmartAlert = {
  id: string;
  coachId: string;
  studentId: string;
  studentName: string;
  type: AlertType;
  dueAt: string;
  daysRemaining: number;
  status: "pending" | "done" | "snoozed";
};

export type Weekday =
  | "Segunda"
  | "Terça"
  | "Quarta"
  | "Quinta"
  | "Sexta"
  | "Sábado"
  | "Domingo";

export const weekdays: Weekday[] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
