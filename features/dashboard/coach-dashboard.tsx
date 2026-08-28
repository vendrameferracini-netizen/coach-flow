import { AlertTriangle, CheckCircle2, Clock, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { CoachDashboardData } from "@/lib/dashboard/supabase-dashboard";

const alertLabels = {
  diet: "Dieta",
  workout: "Treino",
  assessment: "Avaliação",
  protocol: "Protocolo"
};

export function CoachDashboard({ data }: { data: CoachDashboardData }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-forest p-6 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">Dashboard inteligente</p>
        <h2 className="mt-3 text-3xl font-black">Bom dia, {data.coach.fullName.split(" ")[0]}.</h2>
        <p className="mt-2 text-white/72">
          Hoje você possui {data.alerts.filter((alert) => alert.type === "diet").length} dietas para atualizar,{" "}
          {data.alerts.filter((alert) => alert.type === "workout").length} treino para renovar,{" "}
          {data.alerts.filter((alert) => alert.type === "assessment").length} avaliação física e{" "}
          {data.alerts.filter((alert) => alert.type === "protocol").length} protocolo hormonal.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total de alunos" value={data.students.length} />
        <StatCard label="Treinos ativos" value={data.workouts.filter((item) => item.active).length} />
        <StatCard label="Dietas cadastradas" value={data.diets.length} />
        <StatCard label="Avaliações" value={data.assessments.length} />
        <StatCard label="Protocolos" value={data.protocols.length} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black">Alertas do dia</h3>
              <p className="text-sm text-zinc-500">Vencimentos calculados pela frequência de cada aluno.</p>
            </div>
            <Badge tone="warning">{data.alerts.length} pendentes</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {data.alerts.length ? data.alerts.map((alert) => (
              <div key={alert.id} className="grid gap-3 rounded-lg border border-line p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-800">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="block">{alert.studentName}</strong>
                    <span className="text-sm text-zinc-500">
                      {alertLabels[alert.type]} vence em {formatDate(alert.dueAt)} · {alert.daysRemaining} dias restantes
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary">Ver aluno</Button>
                  <Button variant="primary">Concluir</Button>
                  <Button variant="secondary">Adiar</Button>
                </div>
              </div>
            )) : <p className="rounded-lg border border-line p-4 text-sm font-semibold text-zinc-500">Nenhum alerta para hoje.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <LineChart className="h-5 w-5 text-emerald" />
            <h3 className="text-xl font-black">Resumo operacional</h3>
          </div>
          <div className="mt-5 grid gap-4">
            {[
              ["Treinos vencendo", data.alerts.filter((item) => item.type === "workout").length],
              ["Dietas vencendo", data.alerts.filter((item) => item.type === "diet").length],
              ["Avaliações próximas", data.alerts.filter((item) => item.type === "assessment").length],
              ["Protocolos", data.alerts.filter((item) => item.type === "protocol").length]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-line pb-3 last:border-0">
                <span className="text-sm font-semibold text-zinc-500">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-mist p-4 text-sm text-zinc-600">
            <Clock className="mb-2 h-4 w-4 text-emerald" />
            Futuro: esta área está preparada para push notifications, IA e tarefas recorrentes.
          </div>
        </Card>
      </section>

      <Card>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald" />
          <h3 className="text-xl font-black">Alunos ativos</h3>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-3">Aluno</th>
                <th>Objetivo</th>
                <th>Nível</th>
                <th>Status</th>
                <th>Entrada</th>
              </tr>
            </thead>
            <tbody>
              {data.students.length ? data.students.map((student) => (
                <tr key={student.id} className="border-t border-line">
                  <td className="py-3 font-bold">{student.name}</td>
                  <td>{student.goal}</td>
                  <td>{student.level}</td>
                  <td><Badge tone="success">Ativo</Badge></td>
                  <td>{formatDate(student.joinedAt)}</td>
                </tr>
              )) : (
                <tr className="border-t border-line">
                  <td className="py-4 text-sm font-semibold text-zinc-500" colSpan={5}>Nenhum aluno cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
