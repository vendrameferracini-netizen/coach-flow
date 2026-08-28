import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/domain";

export function CoachManagement({ coaches }: { coaches: Profile[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <h2 className="text-xl font-black">Criar Coach</h2>
        <p className="mt-1 text-sm text-zinc-500">Em produção, a criação chama Supabase Auth Admin em uma rota segura de servidor.</p>
        <form className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nome"><Input placeholder="Nome completo" /></Field>
          <Field label="Telefone"><Input placeholder="(00) 00000-0000" /></Field>
          <Field label="E-mail"><Input type="email" placeholder="coach@email.com" /></Field>
          <Field label="CPF"><Input placeholder="000.000.000-00" /></Field>
          <Field label="Status"><Select><option>active</option><option>blocked</option><option>inactive</option></Select></Field>
          <Field label="Plano"><Select><option>Starter</option><option>Pro</option><option>Scale</option></Select></Field>
          <Field label="Observações"><Textarea /></Field>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="button">Criar Coach</Button>
            <Button type="button" variant="secondary">Enviar convite</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-black">Coaches cadastrados</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr><th className="py-3">Coach</th><th>CPF</th><th>Plano</th><th>Status</th><th>Criação</th><th></th></tr>
            </thead>
            <tbody>
              {coaches.map((coach) => (
                <tr key={coach.id} className="border-t border-line">
                  <td className="py-3 font-bold">{coach.fullName}<span className="block text-xs font-medium text-zinc-500">{coach.email}</span></td>
                  <td>{coach.cpf}</td>
                  <td>{coach.plan}</td>
                  <td><Badge tone={coach.status === "active" ? "success" : "danger"}>{coach.status === "active" ? "Ativo" : "Bloqueado"}</Badge></td>
                  <td>{formatDate(coach.createdAt.slice(0, 10))}</td>
                  <td className="flex justify-end gap-2 py-3">
                    <Button type="button" variant="secondary">Editar</Button>
                    <Button type="button" variant="danger">Bloquear</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
