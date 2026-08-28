import { Card, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkoutBoard } from "@/features/training/workout-board";
import { formatDate } from "@/lib/utils";
import type { Assessment, Diet, HormonalProtocol, Message, Student, Workout } from "@/types/domain";

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
  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-forest p-6 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">Área do Aluno</p>
        <h2 className="mt-3 text-3xl font-black">Olá, {student.name.split(" ")[0]}.</h2>
        <p className="mt-2 text-white/72">Aqui estão apenas os dados vinculados ao seu usuário.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Treinos" value={workouts.length} />
        <StatCard label="Dietas" value={diets.length} />
        <StatCard label="Avaliações" value={assessments.length} />
        <StatCard label="Protocolos" value={protocols.length} />
        <StatCard label="Recados" value={messages.length} />
      </section>

      <WorkoutBoard workouts={workouts} readOnly />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="text-xl font-black">Dieta atual</h3>
          {diets[0]?.meals.map((meal) => (
            <div key={meal.id} className="mt-4 rounded-lg border border-line p-4">
              <div className="flex items-center justify-between">
                <strong>{meal.name}</strong>
                <Badge>{meal.time}</Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{meal.foods}</p>
              <p className="mt-1 text-sm font-semibold">{meal.amount}</p>
            </div>
          ))}
        </Card>

        <Card>
          <h3 className="text-xl font-black">Evolução</h3>
          {assessments.map((assessment) => (
            <div key={assessment.id} className="mt-4 rounded-lg border border-line p-4">
              <strong>{formatDate(assessment.assessedAt)}</strong>
              <p className="mt-2 text-sm text-zinc-500">Peso {assessment.weight} kg · Gordura {assessment.bodyFat}% · Massa magra {assessment.leanMass} kg</p>
            </div>
          ))}
        </Card>

        {protocols.length ? (
          <Card>
            <h3 className="text-xl font-black">Protocolo Hormonal</h3>
            {protocols.map((protocol) => (
              <div key={protocol.id} className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <strong>{protocol.medicine}</strong>
                <p className="mt-2 text-sm text-amber-900">{protocol.dosage} · {protocol.days} · {protocol.time}</p>
              </div>
            ))}
          </Card>
        ) : null}
      </section>
    </div>
  );
}
