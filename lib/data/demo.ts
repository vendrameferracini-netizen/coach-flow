import type {
  Assessment,
  Diet,
  ExerciseLibraryItem,
  HormonalProtocol,
  Message,
  Profile,
  SmartAlert,
  Student,
  Workout
} from "@/types/domain";
import { calculateBmi } from "@/lib/utils";

export const demoProfiles: Profile[] = [
  {
    id: "super-admin-1",
    role: "super_admin",
    fullName: "Nicolas Reis",
    email: "admin@coachflow.com",
    phone: "(11) 90000-0000",
    cpf: "000.000.000-00",
    status: "active",
    plan: "platform",
    createdAt: "2026-07-01",
    notes: "Proprietário do sistema."
  },
  {
    id: "coach-1",
    role: "coach",
    fullName: "Mariana Costa",
    email: "coach@coachflow.com",
    phone: "(11) 98888-1111",
    cpf: "123.456.789-00",
    status: "active",
    plan: "Pro",
    createdAt: "2026-07-01",
    notes: "Especialista em hipertrofia."
  },
  {
    id: "student-user-1",
    role: "student",
    fullName: "Lucas Andrade",
    email: "aluno@coachflow.com",
    phone: "(11) 98888-1212",
    status: "active",
    coachId: "coach-1",
    createdAt: "2026-07-02"
  }
];

export const demoStudents: Student[] = [
  {
    id: "student-1",
    coachId: "coach-1",
    authUserId: "student-user-1",
    name: "Lucas Andrade",
    phone: "(11) 98888-1212",
    email: "aluno@coachflow.com",
    birthDate: "1996-04-18",
    sex: "masculino",
    weight: 82,
    height: 1.78,
    goal: "Hipertrofia com foco em superiores",
    level: "intermediario",
    status: "active",
    notes: "Treina no fim da tarde.",
    joinedAt: "2026-07-02",
    dietFrequencyDays: 30,
    workoutFrequencyDays: 28,
    protocolFrequencyDays: 14
  },
  {
    id: "student-2",
    coachId: "coach-1",
    name: "Renata Lima",
    phone: "(21) 97777-9090",
    email: "renata@email.com",
    birthDate: "1989-10-03",
    sex: "feminino",
    weight: 68,
    height: 1.64,
    goal: "Emagrecimento e condicionamento",
    level: "iniciante",
    status: "active",
    notes: "Evitar impacto excessivo nos joelhos.",
    joinedAt: "2026-07-04",
    dietFrequencyDays: 15,
    workoutFrequencyDays: 21,
    protocolFrequencyDays: 0
  }
];

export const demoExercises: ExerciseLibraryItem[] = [
  {
    id: "exercise-supino-reto",
    coachId: "coach-1",
    name: "Supino reto",
    muscleGroup: "Peitoral",
    muscleSubgroup: "Peitoral maior",
    category: "Forca",
    equipment: "Barra e banco",
    difficulty: "intermediario",
    coverUrl: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.youtube.com/results?search_query=supino+reto+execucao",
    description: "Movimento base para desenvolvimento de peitoral, ombros e triceps.",
    executionSteps: ["Deite no banco com os pes firmes no chao.", "Segure a barra com punhos alinhados.", "Desca a barra com controle ate proximo ao peito.", "Empurre mantendo escapulas encaixadas."],
    executionTips: ["Controle a descida.", "Mantenha o peito aberto.", "Evite tirar o quadril do banco."],
    commonMistakes: ["Abrir demais os cotovelos.", "Quicar a barra no peito.", "Perder estabilidade dos ombros."],
    notes: "Pode ser substituido por supino com halteres quando necessario.",
    alternativeIds: ["exercise-supino-inclinado"],
    status: "active"
  },
  {
    id: "exercise-supino-inclinado",
    coachId: "coach-1",
    name: "Supino inclinado",
    muscleGroup: "Peitoral",
    muscleSubgroup: "Porcao superior",
    category: "Forca",
    equipment: "Halteres",
    difficulty: "intermediario",
    coverUrl: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.youtube.com/results?search_query=supino+inclinado+halteres+execucao",
    description: "Variacao com foco na porcao superior do peitoral.",
    executionSteps: ["Ajuste o banco entre 30 e 45 graus.", "Mantenha halteres alinhados ao peito.", "Desca ate amplitude confortavel.", "Suba sem bater os halteres."],
    executionTips: ["Nao transforme o movimento em desenvolvimento de ombro.", "Use carga que permita controle total."],
    commonMistakes: ["Banco muito inclinado.", "Amplitude curta sem necessidade.", "Punhos quebrados."],
    status: "active"
  },
  {
    id: "exercise-puxada-alta",
    coachId: "coach-1",
    name: "Puxada alta",
    muscleGroup: "Costas",
    muscleSubgroup: "Dorsal",
    category: "Maquina",
    equipment: "Polia",
    difficulty: "iniciante",
    coverUrl: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.youtube.com/results?search_query=puxada+alta+execucao",
    description: "Exercicio guiado para aprender a puxada vertical com seguranca.",
    executionSteps: ["Ajuste o apoio das pernas.", "Puxe a barra em direcao ao peito.", "Conduza os cotovelos para baixo.", "Retorne controlando a subida."],
    executionTips: ["Pense em puxar com os cotovelos.", "Evite jogar o tronco para tras."],
    commonMistakes: ["Usar impulso.", "Puxar atras da nuca.", "Subir a carga sem controle."],
    status: "active"
  },
  {
    id: "exercise-remada-baixa",
    coachId: "coach-1",
    name: "Remada baixa",
    muscleGroup: "Costas",
    muscleSubgroup: "Dorsal e romboides",
    category: "Maquina",
    equipment: "Polia baixa",
    difficulty: "iniciante",
    coverUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.youtube.com/results?search_query=remada+baixa+execucao",
    description: "Remada horizontal para costas com boa estabilidade.",
    executionSteps: ["Sente com coluna neutra.", "Puxe a pegada ate a linha do abdomen.", "Aproxime escapulas no final.", "Volte devagar sem arredondar a coluna."],
    executionTips: ["Mantenha o tronco estavel.", "Controle a fase de volta."],
    commonMistakes: ["Balançar o corpo.", "Encolher os ombros.", "Perder postura lombar."],
    status: "active"
  },
  {
    id: "exercise-agachamento-livre",
    coachId: "coach-1",
    name: "Agachamento livre",
    muscleGroup: "Pernas",
    muscleSubgroup: "Quadriceps e gluteos",
    category: "Livre",
    equipment: "Barra",
    difficulty: "avancado",
    coverUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=900&q=80",
    videoUrl: "https://www.youtube.com/results?search_query=agachamento+livre+execucao",
    description: "Padrao fundamental de membros inferiores, indicado quando a tecnica esta madura.",
    executionSteps: ["Posicione a barra com seguranca.", "Afaste os pes em base confortavel.", "Desca mantendo controle do tronco.", "Suba empurrando o chao."],
    executionTips: ["Respeite sua mobilidade.", "Mantenha joelhos acompanhando a ponta dos pes."],
    commonMistakes: ["Perder profundidade por carga excessiva.", "Valgo dinamico sem controle.", "Projetar demais o tronco."],
    status: "active"
  }
];

export const demoWorkouts: Workout[] = [
  {
    id: "workout-1",
    coachId: "coach-1",
    studentId: "student-1",
    name: "Semana A - Hipertrofia",
    startsAt: "2026-07-01",
    expiresAt: "2026-07-29",
    active: true,
    exercises: [
      { id: "ex-1", exerciseId: "exercise-supino-reto", exercise: demoExercises[0], weekday: "Segunda", name: "Supino reto", muscleGroup: "Peitoral", sets: "4", reps: "8", load: "60 kg", rest: "90s", method: "Tradicional", rpe: "8", coachNotes: "Controle na descida", notes: "Controle na descida", logs: [{ id: "log-1", workoutExerciseId: "ex-1", workoutId: "workout-1", studentId: "student-1", coachId: "coach-1", performedAt: "2026-07-22T18:30:00Z", setNumber: 4, status: "completed", loadUsed: "58 kg", repetitionsDone: "8", effortPerception: 8, difficulty: "ideal" }] },
      { id: "ex-2", exerciseId: "exercise-supino-inclinado", exercise: demoExercises[1], weekday: "Segunda", name: "Supino inclinado", muscleGroup: "Peitoral", sets: "3", reps: "10", load: "24 kg", rest: "75s", method: "Tradicional", coachNotes: "Nao perder amplitude" },
      { id: "ex-3", exerciseId: "exercise-puxada-alta", exercise: demoExercises[2], weekday: "Terça", name: "Puxada alta", muscleGroup: "Costas", sets: "4", reps: "10", load: "55 kg", rest: "75s", method: "Cadenciado", coachNotes: "Segurar 1s na contracao" },
      { id: "ex-4", exerciseId: "exercise-remada-baixa", exercise: demoExercises[3], weekday: "Terça", name: "Remada baixa", muscleGroup: "Costas", sets: "4", reps: "10", load: "50 kg", rest: "75s", method: "Tradicional" }
    ]
  }
];

export const demoDiets: Diet[] = [
  {
    id: "diet-1",
    coachId: "coach-1",
    studentId: "student-1",
    name: "Plano Hipertrofia",
    startsAt: "2026-07-01",
    expiresAt: "2026-07-31",
    meals: [
      { id: "meal-1", name: "Café da manhã", time: "07:30", foods: "Ovos, pão integral e banana", amount: "2 ovos, 2 fatias, 1 unidade", substitutions: "Tapioca no lugar do pão" },
      { id: "meal-2", name: "Almoço", time: "12:30", foods: "Arroz, feijão, frango e salada", amount: "120g, 1 concha, 160g, livre", substitutions: "Patinho moído" }
    ]
  }
];

export const demoAssessments: Assessment[] = [
  {
    id: "assessment-1",
    coachId: "coach-1",
    studentId: "student-1",
    assessedAt: "2026-07-01",
    weight: 82,
    height: 1.78,
    bodyFat: 16.8,
    leanMass: 68.2,
    circumferences: { cintura: 86, quadril: 101, braço: 36 },
    photoUrls: [],
    notes: `IMC ${calculateBmi(82, 1.78)}. Boa evolução de força.`
  }
];

export const demoProtocols: HormonalProtocol[] = [
  {
    id: "protocol-1",
    coachId: "coach-1",
    studentId: "student-1",
    medicine: "Vitamina D",
    dosage: "2000 UI",
    days: "Segunda a sexta",
    time: "08:00",
    startsAt: "2026-07-01",
    endsAt: "2026-08-01",
    notes: "Acompanhamento complementar opcional."
  }
];

export const demoMessages: Message[] = [
  {
    id: "message-1",
    coachId: "coach-1",
    studentId: "student-1",
    title: "Ajuste no treino",
    body: "Nesta semana reduza a carga do desenvolvimento e priorize execução.",
    sentAt: "2026-07-06"
  }
];

export const demoAlerts: SmartAlert[] = [
  { id: "alert-1", coachId: "coach-1", studentId: "student-2", studentName: "Renata Lima", type: "diet", dueAt: "2026-07-07", daysRemaining: 1, status: "pending" },
  { id: "alert-2", coachId: "coach-1", studentId: "student-1", studentName: "Lucas Andrade", type: "workout", dueAt: "2026-07-08", daysRemaining: 2, status: "pending" },
  { id: "alert-3", coachId: "coach-1", studentId: "student-1", studentName: "Lucas Andrade", type: "assessment", dueAt: "2026-07-09", daysRemaining: 3, status: "pending" },
  { id: "alert-4", coachId: "coach-1", studentId: "student-1", studentName: "Lucas Andrade", type: "protocol", dueAt: "2026-07-06", daysRemaining: 0, status: "pending" }
];

export function getCoachDashboard(coachId: string) {
  const students = demoStudents.filter((student) => student.coachId === coachId);
  const alerts = demoAlerts.filter((alert) => alert.coachId === coachId && alert.status === "pending");

  return {
    coach: demoProfiles.find((profile) => profile.id === coachId) || demoProfiles[1],
    students,
    workouts: demoWorkouts.filter((workout) => workout.coachId === coachId),
    diets: demoDiets.filter((diet) => diet.coachId === coachId),
    assessments: demoAssessments.filter((assessment) => assessment.coachId === coachId),
    protocols: demoProtocols.filter((protocol) => protocol.coachId === coachId),
    messages: demoMessages.filter((message) => message.coachId === coachId),
    alerts
  };
}

export type CoachDashboardData = ReturnType<typeof getCoachDashboard>;
