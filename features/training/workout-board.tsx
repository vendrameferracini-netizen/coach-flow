"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock3,
  Copy,
  Dumbbell,
  Eye,
  History,
  Layers,
  PlayCircle,
  Plus,
  Save,
  Search,
  TimerReset
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";
import {
  weekdays,
  type ExerciseFeedbackLevel,
  type ExerciseLibraryItem,
  type Student,
  type UserRole,
  type Weekday,
  type Workout,
  type WorkoutExercise
} from "@/types/domain";

type WorkoutBoardProps = {
  profileId?: string;
  role?: UserRole;
  students?: Student[];
  workouts: Workout[];
  exercises?: ExerciseLibraryItem[];
  readOnly?: boolean;
  demoMode?: boolean;
};

type DraftPrescription = {
  id: string;
  exerciseId: string;
  weekday: Weekday;
  sets: string;
  repetitions: string;
  load: string;
  rest: string;
  method: string;
  effortTarget: string;
  targetTime: string;
  targetDistance: string;
  notes: string;
  alternativeExerciseId: string;
};

type ExerciseForm = {
  id?: string;
  name: string;
  muscleGroup: string;
  muscleSubgroup: string;
  category: string;
  equipment: string;
  difficulty: "iniciante" | "intermediario" | "avancado";
  coverUrl: string;
  videoUrl: string;
  description: string;
  executionSteps: string;
  executionTips: string;
  commonMistakes: string;
  notes: string;
};

type RuntimeExercise = WorkoutExercise & {
  workoutId: string;
  workoutName: string;
  studentId: string;
  coachId: string;
};

const emptyExerciseForm: ExerciseForm = {
  name: "",
  muscleGroup: "",
  muscleSubgroup: "",
  category: "",
  equipment: "",
  difficulty: "iniciante",
  coverUrl: "",
  videoUrl: "",
  description: "",
  executionSteps: "",
  executionTips: "",
  commonMistakes: "",
  notes: ""
};

const feedbackOptions: { value: ExerciseFeedbackLevel; label: string; className: string }[] = [
  { value: "facil", label: "Fácil", className: "border-emerald bg-emerald/10 text-forest" },
  { value: "ideal", label: "Ideal", className: "border-forest bg-forest text-white" },
  { value: "dificil", label: "Difícil", className: "border-amber-500 bg-amber-50 text-amber-900" }
];

function parseRestSeconds(rest?: string) {
  if (!rest) return 60;
  const value = Number(rest.replace(/\D/g, ""));
  if (!Number.isFinite(value) || value <= 0) return 60;
  return rest.toLowerCase().includes("min") ? value * 60 : value;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function parsePrescribedSets(sets?: string) {
  const value = Number(String(sets || "").match(/\d+/)?.[0] || "1");
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function splitLines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function joinLines(value?: string[]) {
  return (value || []).join("\n");
}

function ExerciseImage({ exercise, className = "" }: { exercise?: ExerciseLibraryItem; className?: string }) {
  if (!exercise?.coverUrl) {
    return (
      <div className={`flex aspect-[4/3] items-center justify-center rounded-lg bg-mist text-forest ${className}`}>
        <Dumbbell className="h-10 w-10" />
      </div>
    );
  }

  return (
    <img
      src={exercise.coverUrl}
      alt={exercise.name}
      className={`aspect-[4/3] w-full rounded-lg object-cover ${className}`}
    />
  );
}

function lastLogLabel(exercise: WorkoutExercise) {
  const log = exercise.logs?.[0];
  if (!log) return "Sem histórico ainda";
  const date = new Intl.DateTimeFormat("pt-BR").format(new Date(log.performedAt));
  return `${log.loadUsed || "carga não informada"} · ${log.repetitionsDone || "reps não informadas"} reps · ${date}`;
}

function exerciseToForm(exercise: ExerciseLibraryItem): ExerciseForm {
  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    muscleSubgroup: exercise.muscleSubgroup || "",
    category: exercise.category || "",
    equipment: exercise.equipment || "",
    difficulty: exercise.difficulty,
    coverUrl: exercise.coverUrl || "",
    videoUrl: exercise.videoUrl || "",
    description: exercise.description || "",
    executionSteps: joinLines(exercise.executionSteps),
    executionTips: joinLines(exercise.executionTips),
    commonMistakes: joinLines(exercise.commonMistakes),
    notes: exercise.notes || ""
  };
}

function exerciseFromForm(form: ExerciseForm, coachId?: string): ExerciseLibraryItem {
  return {
    id: form.id || crypto.randomUUID(),
    coachId,
    name: form.name,
    muscleGroup: form.muscleGroup,
    muscleSubgroup: form.muscleSubgroup || undefined,
    category: form.category || undefined,
    equipment: form.equipment || undefined,
    difficulty: form.difficulty,
    coverUrl: form.coverUrl || undefined,
    videoUrl: form.videoUrl || undefined,
    description: form.description || undefined,
    executionSteps: splitLines(form.executionSteps),
    executionTips: splitLines(form.executionTips),
    commonMistakes: splitLines(form.commonMistakes),
    notes: form.notes || undefined,
    status: "active"
  };
}

export function WorkoutBoard({
  profileId,
  role = "coach",
  students = [],
  workouts,
  exercises = [],
  readOnly = false,
  demoMode = false
}: WorkoutBoardProps) {
  const [exerciseItems, setExerciseItems] = useState(exercises);
  const [workoutItems, setWorkoutItems] = useState(workouts);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");
  const [equipment, setEquipment] = useState("Todos");
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id || "");
  const [selectedWorkoutExerciseId, setSelectedWorkoutExerciseId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutGoal, setWorkoutGoal] = useState("");
  const [drafts, setDrafts] = useState<DraftPrescription[]>([]);
  const [exerciseForm, setExerciseForm] = useState<ExerciseForm>(emptyExerciseForm);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [feedbackByExercise, setFeedbackByExercise] = useState<Record<string, ExerciseFeedbackLevel>>({});
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [loadByExercise, setLoadByExercise] = useState<Record<string, string>>({});
  const [repsByExercise, setRepsByExercise] = useState<Record<string, string>>({});
  const [notesByExercise, setNotesByExercise] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => setExerciseItems(exercises), [exercises]);
  useEffect(() => setWorkoutItems(workouts), [workouts]);

  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = window.setInterval(() => setTimerSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [timerSeconds]);

  const groups = useMemo(() => ["Todos", ...Array.from(new Set(exerciseItems.map((item) => item.muscleGroup))).sort()], [exerciseItems]);
  const equipments = useMemo(() => ["Todos", ...Array.from(new Set(exerciseItems.map((item) => item.equipment).filter(Boolean) as string[])).sort()], [exerciseItems]);
  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return exerciseItems.filter((exercise) => {
      const matchesQuery = !normalizedQuery || [exercise.name, exercise.muscleGroup, exercise.muscleSubgroup, exercise.equipment]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesGroup = group === "Todos" || exercise.muscleGroup === group;
      const matchesEquipment = equipment === "Todos" || exercise.equipment === equipment;
      return matchesQuery && matchesGroup && matchesEquipment && exercise.status === "active";
    });
  }, [equipment, exerciseItems, group, query]);

  const selectedExercise = exerciseItems.find((exercise) => exercise.id === selectedExerciseId) || filteredExercises[0];
  const runtimeExercises: RuntimeExercise[] = workoutItems.flatMap((workout) =>
    workout.exercises.map((exercise) => ({
      ...exercise,
      workoutId: workout.id,
      workoutName: workout.name,
      studentId: workout.studentId,
      coachId: workout.coachId
    }))
  );
  const selectedWorkoutExercise = runtimeExercises.find((exercise) => exercise.id === selectedWorkoutExerciseId) || (readOnly ? undefined : runtimeExercises[0]);
  const detailExercise = selectedWorkoutExercise?.exercise || selectedExercise;

  function addDraft() {
    if (!selectedExercise) {
      setStatus("Cadastre ou selecione um exercício antes de adicionar ao treino.");
      return;
    }
    setDrafts((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        exerciseId: selectedExercise.id,
        weekday: "Segunda",
        sets: "3",
        repetitions: "10",
        load: "",
        rest: "60s",
        method: "Tradicional",
        effortTarget: "",
        targetTime: "",
        targetDistance: "",
        notes: "",
        alternativeExerciseId: ""
      }
    ]);
  }

  function updateDraft(id: string, patch: Partial<DraftPrescription>) {
    setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...patch } : draft));
  }

  function moveDraft(index: number, direction: -1 | 1) {
    setDrafts((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function saveExercise() {
    if (!exerciseForm.name || !exerciseForm.muscleGroup) {
      setStatus("Informe pelo menos nome e grupo muscular do exercício.");
      return;
    }

    const next = exerciseFromForm(exerciseForm, profileId);
    if (demoMode) {
      setExerciseItems((current) => exerciseForm.id ? current.map((item) => item.id === next.id ? next : item) : [next, ...current]);
      setSelectedExerciseId(next.id);
      setExerciseForm(emptyExerciseForm);
      setStatus("Exercício salvo no modo demo. Em produção, será gravado no Supabase.");
      return;
    }

    const supabase = createClient() as any;
    const payload = {
      id: exerciseForm.id || undefined,
      coach_id: profileId,
      name: exerciseForm.name,
      muscle_group: exerciseForm.muscleGroup,
      muscle_subgroup: exerciseForm.muscleSubgroup || null,
      category: exerciseForm.category || null,
      equipment: exerciseForm.equipment || null,
      difficulty: exerciseForm.difficulty,
      cover_url: exerciseForm.coverUrl || null,
      video_url: exerciseForm.videoUrl || null,
      description: exerciseForm.description || null,
      execution_steps: splitLines(exerciseForm.executionSteps),
      execution_tips: splitLines(exerciseForm.executionTips),
      common_mistakes: splitLines(exerciseForm.commonMistakes),
      notes: exerciseForm.notes || null,
      status: "active",
      created_by: profileId
    };

    const { data, error } = await supabase.from("exercise_library").upsert(payload).select("*").single();
    if (error) {
      setStatus(`Erro ao salvar exercício: ${error.message}`);
      return;
    }

    const saved = exerciseFromForm({ ...exerciseForm, id: data.id }, profileId);
    setExerciseItems((current) => current.some((item) => item.id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
    setSelectedExerciseId(saved.id);
    setExerciseForm(emptyExerciseForm);
    setStatus("Exercício salvo no Supabase.");
  }

  async function saveWorkout() {
    if (!profileId || !selectedStudentId || !workoutName || !drafts.length) {
      setStatus("Selecione aluno, informe o nome do treino e adicione exercícios.");
      return;
    }

    if (demoMode) {
      setStatus("Treino montado no modo demo. Em produção, será gravado no Supabase.");
      return;
    }

    const supabase = createClient() as any;
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        coach_id: profileId,
        student_id: selectedStudentId,
        name: workoutName,
        goal: workoutGoal || null,
        created_by: profileId,
        active: true
      })
      .select("*")
      .single();

    if (workoutError) {
      setStatus(`Erro ao salvar treino: ${workoutError.message}`);
      return;
    }

    const exercisePayload = drafts.map((draft, index) => {
      const exercise = exerciseItems.find((item) => item.id === draft.exerciseId);
      const [rpe, rir] = draft.effortTarget.toUpperCase().startsWith("RIR")
        ? [null, draft.effortTarget]
        : [draft.effortTarget || null, null];
      return {
        workout_id: workout.id,
        exercise_id: draft.exerciseId,
        alternative_exercise_id: draft.alternativeExerciseId || null,
        weekday: draft.weekday,
        name: exercise?.name || "Exercício",
        muscle_group: exercise?.muscleGroup || null,
        sets: draft.sets,
        repetitions: draft.repetitions,
        load: draft.load || null,
        rest: draft.rest || null,
        target_time: draft.targetTime || null,
        target_distance: draft.targetDistance || null,
        rpe,
        rir,
        method: draft.method || null,
        coach_notes: draft.notes || null,
        position: index
      };
    });

    const { error: exercisesError } = await supabase.from("workout_exercises").insert(exercisePayload);
    if (exercisesError) {
      setStatus(`Treino criado, mas houve erro nos exercícios: ${exercisesError.message}`);
      return;
    }

    setDrafts([]);
    setWorkoutName("");
    setWorkoutGoal("");
    setStatus("Treino salvo no Supabase e vinculado ao aluno.");
  }

  async function completeSet(exercise: RuntimeExercise) {
    const done = (completedSets[exercise.id] || 0) + 1;
    setCompletedSets((current) => ({ ...current, [exercise.id]: done }));
    setTimerSeconds(parseRestSeconds(exercise.rest));

    if (demoMode) {
      setStatus("Série registrada no modo demo.");
      return;
    }

    const supabase = createClient() as any;
    const { error } = await supabase.from("workout_exercise_logs").insert({
      workout_exercise_id: exercise.id,
      workout_id: exercise.workoutId,
      student_id: exercise.studentId,
      coach_id: exercise.coachId,
      set_number: done,
      status: "completed",
      load_used: loadByExercise[exercise.id] || null,
      repetitions_done: repsByExercise[exercise.id] || null,
      effort_perception: null,
      difficulty: feedbackByExercise[exercise.id] || null,
      notes: notesByExercise[exercise.id] || null
    });

    setStatus(error ? `Erro ao registrar série: ${error.message}` : "Série registrada no Supabase.");
  }

  async function saveWorkoutFeedback(exercise: RuntimeExercise, feedback: ExerciseFeedbackLevel) {
    setFeedbackByExercise((current) => ({ ...current, [exercise.id]: feedback }));
    if (demoMode) return;

    const supabase = createClient() as any;
    await supabase.from("workout_feedbacks").insert({
      workout_id: exercise.workoutId,
      student_id: exercise.studentId,
      coach_id: exercise.coachId,
      feedback,
      notes: notesByExercise[exercise.id] || null
    });
  }

  if (readOnly) {
    const todayWeekday = weekdays[(new Date().getDay() + 6) % 7];
    const currentWorkout = workoutItems.find((workout) => workout.active) || workoutItems[0];
    const todaysExercises = currentWorkout?.exercises.filter((exercise) => exercise.weekday === todayWeekday) || [];
    const visibleExercises = todaysExercises.length ? todaysExercises : currentWorkout?.exercises || [];
    const completedExerciseCount = visibleExercises.filter((exercise) => (completedSets[exercise.id] || 0) >= parsePrescribedSets(exercise.sets)).length;
    const progress = visibleExercises.length ? Math.round((completedExerciseCount / visibleExercises.length) * 100) : 0;
    const workoutFinished = visibleExercises.length > 0 && completedExerciseCount === visibleExercises.length;

    return (
      <div className="mx-auto grid max-w-3xl gap-4 pb-28 lg:pb-6">
        <section className="rounded-lg bg-blue-600 p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Treino de hoje</p>
              <h2 className="mt-2 text-3xl font-black">{currentWorkout?.name || "Nenhum treino disponível"}</h2>
              <p className="mt-1 text-sm font-semibold text-white/78">
                {visibleExercises.length ? `${completedExerciseCount} de ${visibleExercises.length} exercícios concluídos` : "Seu treino aparecerá aqui quando for cadastrado."}
              </p>
            </div>
            {currentWorkout ? <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black text-white">{todaysExercises.length ? todayWeekday : "Atual"}</span> : null}
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
          {timerSeconds > 0 ? (
            <div className="mt-5 flex items-center justify-between rounded-lg bg-white/14 p-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Descanso</span>
                <strong className="mt-1 block text-4xl">{formatTimer(timerSeconds)}</strong>
              </div>
              <Button type="button" variant="secondary" onClick={() => setTimerSeconds(Math.max(0, timerSeconds - 15))}>
                <TimerReset className="h-4 w-4" /> -15s
              </Button>
            </div>
          ) : null}
          {workoutFinished ? (
            <div className="mt-5 rounded-lg bg-white p-4 text-blue-900">
              <strong className="block text-xl">🎉 Treino concluído</strong>
              <span className="mt-1 block text-sm font-semibold">Bom trabalho. Seu histórico foi registrado durante as séries concluídas.</span>
            </div>
          ) : null}
        </section>

        {currentWorkout && visibleExercises.length ? (
          <section className="grid gap-4">
            {visibleExercises.map((exercise) => {
              const runtimeExercise: RuntimeExercise = { ...exercise, workoutId: currentWorkout.id, workoutName: currentWorkout.name, studentId: currentWorkout.studentId, coachId: currentWorkout.coachId };
              const done = completedSets[exercise.id] || 0;
              const prescribedSets = parsePrescribedSets(exercise.sets);
              const exerciseDone = done >= prescribedSets;

              return (
                <article
                  key={exercise.id}
                  className={`grid gap-3 rounded-lg border bg-white p-3 shadow-soft transition ${exerciseDone ? "border-emerald-200 bg-emerald-50" : "border-line"}`}
                >
                  <ExerciseImage exercise={exercise.exercise} className={exerciseDone ? "opacity-70" : ""} />
                  <div className="grid gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong className="block text-2xl text-ink">{exercise.name}</strong>
                        <span className="text-sm font-semibold text-zinc-500">{exercise.muscleGroup} · {exercise.exercise?.equipment || "Livre"}</span>
                      </div>
                      <Badge tone={exerciseDone ? "success" : "neutral"}>{exerciseDone ? "Concluído" : `${done}/${prescribedSets}`}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <span className="rounded-lg bg-blue-50 p-3 font-semibold text-blue-900"><strong className="block text-xl">{exercise.sets}x{exercise.reps}</strong>Séries</span>
                      <span className="rounded-lg bg-zinc-100 p-3 font-semibold text-zinc-800"><strong className="block text-xl">{exercise.load || "-"}</strong>Carga</span>
                      <span className="rounded-lg bg-amber-50 p-3 font-semibold text-amber-900"><strong className="block text-xl">{exercise.rest || "-"}</strong>Descanso</span>
                    </div>
                    {exercise.coachNotes || exercise.notes ? (
                      <p className="rounded-lg bg-mist p-3 text-sm font-semibold text-zinc-600">{exercise.coachNotes || exercise.notes}</p>
                    ) : null}
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                      <History className="h-4 w-4" /> Último treino: {lastLogLabel(exercise)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant="secondary" className="min-h-12" onClick={() => setSelectedWorkoutExerciseId(exercise.id)}>
                        <Eye className="h-4 w-4" /> Ver exercício
                      </Button>
                      {exercise.exercise?.videoUrl ? (
                        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-bold text-white" href={exercise.exercise.videoUrl} target="_blank">
                          <PlayCircle className="h-4 w-4" /> Ver vídeo
                        </a>
                      ) : (
                        <Button type="button" variant="secondary" className="min-h-12" disabled><PlayCircle className="h-4 w-4" /> Sem vídeo</Button>
                      )}
                      <Button type="button" variant="secondary" className="min-h-12" onClick={() => setSelectedWorkoutExerciseId(exercise.id)}>
                        <Dumbbell className="h-4 w-4" /> Como fazer
                      </Button>
                      <Button type="button" className="min-h-12 bg-blue-600 hover:bg-blue-700" onClick={() => completeSet(runtimeExercise)} disabled={exerciseDone}>
                        <CheckCircle2 className="h-4 w-4" /> {exerciseDone ? "Concluído" : "Concluir série"}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <Card className="p-6 text-center">
            <Dumbbell className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 text-sm font-semibold text-zinc-500">Nenhum treino disponível no momento.</p>
          </Card>
        )}

        {selectedWorkoutExercise ? (
          <Card className="sticky bottom-24 z-10 border-blue-200 p-4 shadow-2xl lg:bottom-4">
            <div className="grid gap-4">
              <ExerciseImage exercise={detailExercise} />
              <div>
                <h3 className="text-xl font-black">{selectedWorkoutExercise.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{detailExercise?.description || selectedWorkoutExercise.coachNotes}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Field label="Carga usada"><Input value={loadByExercise[selectedWorkoutExercise.id] || ""} onChange={(event) => setLoadByExercise((current) => ({ ...current, [selectedWorkoutExercise.id]: event.target.value }))} placeholder={selectedWorkoutExercise.load || "kg"} /></Field>
                  <Field label="Repetições"><Input value={repsByExercise[selectedWorkoutExercise.id] || ""} onChange={(event) => setRepsByExercise((current) => ({ ...current, [selectedWorkoutExercise.id]: event.target.value }))} placeholder={selectedWorkoutExercise.reps} /></Field>
                  <Field label="Observação"><Input value={notesByExercise[selectedWorkoutExercise.id] || ""} onChange={(event) => setNotesByExercise((current) => ({ ...current, [selectedWorkoutExercise.id]: event.target.value }))} placeholder="Como foi?" /></Field>
                </div>
                <div className="mt-4 grid gap-2">
                  <strong>Como fazer</strong>
                  <ul className="grid gap-1 text-sm text-zinc-600">
                    {(detailExercise?.executionSteps || []).map((step) => <li key={step}>• {step}</li>)}
                  </ul>
                </div>
                <div className="mt-4 grid gap-2">
                  <strong>Dicas rápidas</strong>
                  <div className="grid gap-2 text-sm text-zinc-600">
                    {(detailExercise?.executionTips || []).slice(0, 3).map((tip) => <span key={tip} className="rounded-lg bg-mist p-2">{tip}</span>)}
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <strong>Feedback</strong>
                  <div className="grid grid-cols-3 gap-2">
                    {feedbackOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`min-h-12 rounded-lg border px-3 text-sm font-black ${feedbackByExercise[selectedWorkoutExercise.id] === option.value ? option.className : "border-line bg-white text-coal"}`}
                        onClick={() => saveWorkoutFeedback(selectedWorkoutExercise, option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" className="min-h-12 bg-blue-600 hover:bg-blue-700" onClick={() => completeSet(selectedWorkoutExercise)}>
                    <CheckCircle2 className="h-4 w-4" /> Concluir série
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setTimerSeconds(parseRestSeconds(selectedWorkoutExercise.rest))}>
                    <Clock3 className="h-4 w-4" /> Iniciar descanso
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : null}
        {status ? <p className="rounded-lg bg-mist p-3 text-sm font-semibold text-forest">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="grid gap-6">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Biblioteca de exercícios</h2>
            <Badge>{exerciseItems.length} itens</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input className="pl-10" placeholder="Pesquisar exercício" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <Select value={group} onChange={(event) => setGroup(event.target.value)}>
              {groups.map((item) => <option key={item}>{item}</option>)}
            </Select>
            <Select value={equipment} onChange={(event) => setEquipment(event.target.value)}>
              {equipments.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </div>
          <div className="mt-4 grid gap-3">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => {
                  setSelectedExerciseId(exercise.id);
                  if (exercise.coachId === profileId) setExerciseForm(exerciseToForm(exercise));
                }}
                className="grid gap-3 rounded-lg border border-line p-3 text-left transition hover:border-forest md:grid-cols-[104px_1fr]"
              >
                <ExerciseImage exercise={exercise} />
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <strong className="text-lg">{exercise.name}</strong>
                    <Badge>{exercise.difficulty}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{exercise.muscleGroup} · {exercise.muscleSubgroup || "Sem subgrupo"} · {exercise.equipment || "Livre"}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{exercise.description || "Sem descrição cadastrada."}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">{exerciseForm.id ? "Editar exercício próprio" : "Novo exercício próprio"}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Nome"><Input value={exerciseForm.name} onChange={(event) => setExerciseForm((current) => ({ ...current, name: event.target.value }))} placeholder="Agachamento livre" /></Field>
            <Field label="Grupo muscular"><Input value={exerciseForm.muscleGroup} onChange={(event) => setExerciseForm((current) => ({ ...current, muscleGroup: event.target.value }))} placeholder="Pernas" /></Field>
            <Field label="Subgrupo"><Input value={exerciseForm.muscleSubgroup} onChange={(event) => setExerciseForm((current) => ({ ...current, muscleSubgroup: event.target.value }))} placeholder="Quadríceps e glúteos" /></Field>
            <Field label="Equipamento"><Input value={exerciseForm.equipment} onChange={(event) => setExerciseForm((current) => ({ ...current, equipment: event.target.value }))} placeholder="Barra, halteres, polia" /></Field>
            <Field label="Categoria"><Input value={exerciseForm.category} onChange={(event) => setExerciseForm((current) => ({ ...current, category: event.target.value }))} placeholder="Força, cardio, mobilidade" /></Field>
            <Field label="Nível"><Select value={exerciseForm.difficulty} onChange={(event) => setExerciseForm((current) => ({ ...current, difficulty: event.target.value as ExerciseForm["difficulty"] }))}><option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option></Select></Field>
            <Field label="URL da imagem"><Input value={exerciseForm.coverUrl} onChange={(event) => setExerciseForm((current) => ({ ...current, coverUrl: event.target.value }))} placeholder="https://..." /></Field>
            <Field label="URL do vídeo"><Input value={exerciseForm.videoUrl} onChange={(event) => setExerciseForm((current) => ({ ...current, videoUrl: event.target.value }))} placeholder="YouTube, Vimeo ou storage" /></Field>
            <Field label="Descrição"><Textarea value={exerciseForm.description} onChange={(event) => setExerciseForm((current) => ({ ...current, description: event.target.value }))} /></Field>
            <Field label="Passo a passo"><Textarea value={exerciseForm.executionSteps} onChange={(event) => setExerciseForm((current) => ({ ...current, executionSteps: event.target.value }))} placeholder="Uma instrução por linha" /></Field>
            <Field label="Dicas"><Textarea value={exerciseForm.executionTips} onChange={(event) => setExerciseForm((current) => ({ ...current, executionTips: event.target.value }))} placeholder="Uma dica por linha" /></Field>
            <Field label="Erros comuns"><Textarea value={exerciseForm.commonMistakes} onChange={(event) => setExerciseForm((current) => ({ ...current, commonMistakes: event.target.value }))} placeholder="Um erro por linha" /></Field>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="button" onClick={saveExercise}><Save className="h-4 w-4" /> Salvar exercício</Button>
              <Button type="button" variant="secondary" onClick={() => setExerciseForm(emptyExerciseForm)}>Limpar</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <h2 className="text-xl font-black">Montar treino real</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Aluno">
              <Select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </Select>
            </Field>
            <Field label="Nome do treino"><Input value={workoutName} onChange={(event) => setWorkoutName(event.target.value)} placeholder="Semana A" /></Field>
            <Field label="Objetivo"><Input value={workoutGoal} onChange={(event) => setWorkoutGoal(event.target.value)} placeholder="Hipertrofia, força, emagrecimento" /></Field>
            <div className="flex items-end">
              <Button type="button" className="w-full" onClick={addDraft}><Plus className="h-4 w-4" /> Adicionar selecionado</Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {drafts.map((draft, index) => {
              const exercise = exerciseItems.find((item) => item.id === draft.exerciseId);
              return (
                <div key={draft.id} className="grid gap-3 rounded-lg border border-line p-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{exercise?.name || "Exercício"}</strong>
                    <div className="flex gap-1">
                      <Button type="button" variant="secondary" className="h-9 min-h-9 px-3" onClick={() => moveDraft(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                      <Button type="button" variant="secondary" className="h-9 min-h-9 px-3" onClick={() => moveDraft(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Field label="Dia"><Select value={draft.weekday} onChange={(event) => updateDraft(draft.id, { weekday: event.target.value as Weekday })}>{weekdays.map((day) => <option key={day}>{day}</option>)}</Select></Field>
                    <Field label="Séries"><Input value={draft.sets} onChange={(event) => updateDraft(draft.id, { sets: event.target.value })} /></Field>
                    <Field label="Repetições"><Input value={draft.repetitions} onChange={(event) => updateDraft(draft.id, { repetitions: event.target.value })} /></Field>
                    <Field label="Carga"><Input value={draft.load} onChange={(event) => updateDraft(draft.id, { load: event.target.value })} /></Field>
                    <Field label="Descanso"><Input value={draft.rest} onChange={(event) => updateDraft(draft.id, { rest: event.target.value })} /></Field>
                    <Field label="Método"><Input value={draft.method} onChange={(event) => updateDraft(draft.id, { method: event.target.value })} /></Field>
                    <Field label="RPE/RIR"><Input value={draft.effortTarget} onChange={(event) => updateDraft(draft.id, { effortTarget: event.target.value })} /></Field>
                    <Field label="Tempo"><Input value={draft.targetTime} onChange={(event) => updateDraft(draft.id, { targetTime: event.target.value })} /></Field>
                    <Field label="Distância"><Input value={draft.targetDistance} onChange={(event) => updateDraft(draft.id, { targetDistance: event.target.value })} /></Field>
                    <Field label="Alternativo"><Select value={draft.alternativeExerciseId} onChange={(event) => updateDraft(draft.id, { alternativeExerciseId: event.target.value })}><option value="">Sem alternativo</option>{exerciseItems.filter((item) => item.id !== draft.exerciseId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
                    <Field label="Observação"><Textarea value={draft.notes} onChange={(event) => updateDraft(draft.id, { notes: event.target.value })} /></Field>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={saveWorkout}><Save className="h-4 w-4" /> Salvar treino no Supabase</Button>
            <Button type="button" variant="secondary"><Copy className="h-4 w-4" /> Duplicar treino</Button>
            <Button type="button" variant="secondary"><Layers className="h-4 w-4" /> Salvar modelo</Button>
          </div>
          {status ? <p className="mt-4 rounded-lg bg-mist p-3 text-sm font-semibold text-forest">{status}</p> : null}
        </Card>

        {workoutItems.map((workout) => (
          <Card key={workout.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">{workout.name}</h3>
                <p className="text-sm text-zinc-500">{workout.goal || "Objetivo não informado"} · Validade até {workout.expiresAt || "sem data"}</p>
              </div>
              <Badge tone="success">Ativo</Badge>
            </div>
            <div className="mt-5 grid gap-4">
              {weekdays.map((day) => {
                const dayExercises = workout.exercises.filter((exercise) => exercise.weekday === day);
                if (!dayExercises.length) return null;
                return (
                  <section key={day} className="rounded-lg border border-line p-4">
                    <h4 className="font-black text-forest">{day}</h4>
                    <div className="mt-3 grid gap-2">
                      {dayExercises.map((exercise) => (
                        <div key={exercise.id} className="grid gap-3 border-t border-line pt-3 md:grid-cols-[72px_1fr_auto]">
                          <ExerciseImage exercise={exercise.exercise} />
                          <div>
                            <strong>{exercise.name}</strong>
                            <p className="text-sm text-zinc-500">{exercise.muscleGroup} · {exercise.method || "Método livre"} · {exercise.coachNotes || exercise.notes}</p>
                            <p className="mt-1 text-xs font-semibold text-forest">Último aluno: {lastLogLabel(exercise)}</p>
                          </div>
                          <span className="text-sm font-bold">{exercise.sets} séries · {exercise.reps} reps · {exercise.rest}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
