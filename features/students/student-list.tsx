import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Student } from "@/types/domain";

export function StudentList({ students }: { students: Student[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <h2 className="text-xl font-black">Cadastrar aluno</h2>
        <p className="mt-1 text-sm text-zinc-500">Ao salvar em produção, o Supabase Auth cria o login e gera senha inicial.</p>
        <form className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nome"><Input placeholder="Nome completo" /></Field>
          <Field label="Telefone"><Input placeholder="(00) 00000-0000" /></Field>
          <Field label="E-mail"><Input type="email" placeholder="aluno@email.com" /></Field>
          <Field label="Nascimento"><Input type="date" /></Field>
          <Field label="Sexo"><Select><option>feminino</option><option>masculino</option><option>outro</option></Select></Field>
          <Field label="Nível"><Select><option>iniciante</option><option>intermediario</option><option>avancado</option></Select></Field>
          <Field label="Peso"><Input type="number" placeholder="82" /></Field>
          <Field label="Altura"><Input placeholder="1.78" /></Field>
          <Field label="Objetivo"><Input placeholder="Hipertrofia" /></Field>
          <Field label="Status"><Select><option>active</option><option>inactive</option><option>blocked</option></Select></Field>
          <Field label="Observações"><Textarea className="md:col-span-2" /></Field>
          <div className="md:col-span-2"><Button type="button">Salvar aluno e criar login</Button></div>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Alunos do Coach</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr><th className="py-3">Aluno</th><th>Objetivo</th><th>Nível</th><th>Status</th><th>Entrada</th><th></th></tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-line">
                  <td className="py-3 font-bold">{student.name}<span className="block text-xs font-medium text-zinc-500">{student.email}</span></td>
                  <td>{student.goal}</td>
                  <td>{student.level}</td>
                  <td><Badge tone="success">Ativo</Badge></td>
                  <td>{formatDate(student.joinedAt)}</td>
                  <td className="text-right"><Button variant="secondary" type="button">Editar</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
