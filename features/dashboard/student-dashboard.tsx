import Link from "next/link";
import type { ComponentType } from "react";
import { Activity, Bell, ClipboardList, Dumbbell, MessageCircle, Soup, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Assessment, Diet, HormonalProtocol, Message, Student, Workout } from "@/types/domain";

const cardStyles = {
  diet: "border-emerald bg-emerald text-white shadow-emerald/20 hover:bg-forest",
  progress: "border-violet-100 bg-violet-600 text-white shadow-violet-200/60",
  coach: "border-orange-100 bg-orange-500 text-white shadow-orange-200/60",
  assessment: "border-amber-100 bg-amber-400 text-amber-950 shadow-amber-200/60",
  alerts: "border-rose-100 bg-rose-500 text-white shadow-rose-200/60",
  profile: "border-zinc-200 bg-zinc-900 text-white shadow-zinc-200/60"
};

function firstName(name: string) {
  return name.trim().split(" ")[0] || "Aluno";
}

function todayLabel() {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date());
}

function StudentActionCard({
  href,
  title,
  value,
  icon: Icon,
  className
}: {
  href: string;
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`grid min-h-32 content-between rounded-lg border p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/18">
          <Icon className="h-6 w-6" />
        </span>
        <span className="text-2xl font-black">›</span>
      </div>
      <div>
        <strong className="block text-lg">{title}</strong>
        <span className="mt-1 block text-sm font-semibold opacity-80">{value}</span>
      </div>
    </Link>
  );
}

export function StudentDashboard({
  student,
  workouts,
  diets,
  assessments,
  protocols,
  messages
}: {
  student: Student;
  workouts: Workout[];
  diets: Diet[];
  assessments: Assessment[];
  protocols: HormonalProtocol[];
  messages: Message[];
}) {
  const currentWorkout = workouts.find((workout) => workout.active) || workouts[0];
  const currentDiet = diets[0];
  const latestAssessment = assessments[0];
  const unreadMessages = messages.filter((message) => !message.readAt).length;
  const workoutExerciseCount = currentWorkout?.exercises.length || 0;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 pb-24 lg:pb-0">
      <section className="grid gap-2">
        <h2 className="text-3xl font-black text-ink md:text-4xl">Olá, {firstName(student.name)} 👋</h2>
        <p className="text-base font-semibold text-zinc-500">
          {todayLabel()}. {currentWorkout ? `Seu treino está pronto com ${workoutExerciseCount} exercícios.` : "Nenhum treino disponível no momento."}
        </p>
      </section>

      <Link
        href="/treinos"
        className="relative overflow-hidden rounded-lg bg-blue-600 p-5 text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg md:p-7"
      >
        <div className="relative z-10 flex min-h-44 flex-col justify-between gap-5">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-white/18">
              <Dumbbell className="h-7 w-7" />
            </span>
            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black text-white">Principal</span>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/72">Treino de hoje</p>
            <h3 className="mt-2 text-3xl font-black">{currentWorkout?.name || "Nenhum treino disponível"}</h3>
            <p className="mt-2 max-w-xl text-sm font-semibold text-white/82">
              {currentWorkout ? `${workoutExerciseCount} exercícios no treino atual.` : "Quando seu Coach cadastrar um treino, ele aparecerá aqui."}
            </p>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/12" />
        <div className="absolute bottom-4 right-5 text-6xl font-black text-white/12">CF</div>
      </Link>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StudentActionCard href="/dietas" title="Minha dieta" value={currentDiet?.name || "Sem dieta ativa"} icon={Soup} className={cardStyles.diet} />
        <StudentActionCard href="/avaliacoes" title="Minha evolução" value={latestAssessment ? `${latestAssessment.weight} kg em ${formatDate(latestAssessment.assessedAt)}` : "Sem avaliação"} icon={Activity} className={cardStyles.progress} />
        <StudentActionCard href="/recados" title="Falar com Coach" value={messages.length ? `${messages.length} recados` : "Sem recados"} icon={MessageCircle} className={cardStyles.coach} />
        <StudentActionCard href="/avaliacoes" title="Minha avaliação" value={latestAssessment ? "Histórico disponível" : "Sem avaliação"} icon={ClipboardList} className={cardStyles.assessment} />
        <StudentActionCard href="/recados" title="Avisos" value={unreadMessages ? `${unreadMessages} não lidos` : "Nenhum aviso"} icon={Bell} className={cardStyles.alerts} />
        <StudentActionCard href="/perfil" title="Perfil" value={student.goal || "Dados pessoais"} icon={UserRound} className={cardStyles.profile} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Próxima refeição</h3>
            <Badge>{currentDiet?.name || "Dieta"}</Badge>
          </div>
          {currentDiet?.meals[0] ? (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <strong>{currentDiet.meals[0].name}</strong>
                <Badge tone="success">{currentDiet.meals[0].time}</Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{currentDiet.meals[0].foods}</p>
              <p className="mt-1 text-sm font-bold text-forest">{currentDiet.meals[0].amount}</p>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-mist p-4 text-sm font-semibold text-zinc-500">Nenhuma dieta disponível no momento.</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Última evolução</h3>
            <Badge>{assessments.length} registros</Badge>
          </div>
          {latestAssessment ? (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <span className="rounded-lg bg-violet-50 p-3 text-sm font-semibold text-violet-900"><strong className="block text-xl">{latestAssessment.weight}</strong>kg</span>
              <span className="rounded-lg bg-violet-50 p-3 text-sm font-semibold text-violet-900"><strong className="block text-xl">{latestAssessment.bodyFat}</strong>% gordura</span>
              <span className="rounded-lg bg-violet-50 p-3 text-sm font-semibold text-violet-900"><strong className="block text-xl">{latestAssessment.leanMass}</strong>kg massa</span>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-mist p-4 text-sm font-semibold text-zinc-500">Nenhuma avaliação disponível no momento.</p>
          )}
        </Card>
      </section>

      {protocols.length ? (
        <Card className="border-amber-100 bg-amber-50 p-4">
          <h3 className="text-lg font-black text-amber-950">Protocolo Hormonal</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {protocols.map((protocol) => (
              <div key={protocol.id} className="rounded-lg bg-white p-4">
                <strong className="text-amber-950">{protocol.medicine}</strong>
                <p className="mt-2 text-sm font-semibold text-amber-800">{protocol.dosage} · {protocol.days} · {protocol.time}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
