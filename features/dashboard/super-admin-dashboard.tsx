import { Card, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Profile, Student } from "@/types/domain";
import { formatDate } from "@/lib/utils";

export function SuperAdminDashboard({ coaches, students }: { coaches: Profile[]; students: Student[] }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-forest p-6 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">Super Admin</p>
        <h2 className="mt-3 text-3xl font-black">Visão geral da plataforma.</h2>
        <p className="mt-2 text-white/72">Coaches, planos e estatísticas gerais organizadas sem misturar dados operacionais.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Coaches cadastrados" value={coaches.length} />
        <StatCard label="Coaches ativos" value={coaches.filter((coach) => coach.status === "active").length} />
        <StatCard label="Alunos na plataforma" value={students.length} />
        <StatCard label="Planos Pro" value={coaches.filter((coach) => coach.plan === "Pro").length} />
      </section>

      <Card>
        <h3 className="text-xl font-black">Coaches</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-3">Coach</th>
                <th>Telefone</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Criação</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id} className="border-t border-line">
                  <td className="py-3 font-bold">{coach.fullName}<span className="block text-xs font-medium text-zinc-500">{coach.email}</span></td>
                  <td>{coach.phone}</td>
                  <td>{coach.plan}</td>
                  <td><Badge tone={coach.status === "active" ? "success" : "danger"}>{coach.status === "active" ? "Ativo" : "Bloqueado"}</Badge></td>
                  <td>{formatDate(coach.createdAt.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
