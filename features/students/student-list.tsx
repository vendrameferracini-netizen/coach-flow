"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createStudentAction, type CreateStudentState } from "@/app/(app)/alunos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Student } from "@/types/domain";

const initialState: CreateStudentState = { ok: false, message: "" };

export function StudentList({ students }: { students: Student[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createStudentAction, initialState);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [router, state.ok]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <h2 className="text-xl font-black">Cadastrar aluno</h2>
        <p className="mt-1 text-sm text-zinc-500">Crie o aluno e envie um convite seguro para ele definir a senha.</p>
        <form ref={formRef} action={formAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nome completo"><Input name="fullName" placeholder="Nome completo" required /></Field>
          <Field label="E-mail"><Input name="email" type="email" placeholder="aluno@email.com" required /></Field>
          <Field label="Telefone"><Input name="phone" placeholder="(00) 00000-0000" /></Field>
          <Field label="Data de nascimento"><Input name="birthDate" type="date" /></Field>
          <Field label="Objetivo"><Input name="goal" placeholder="Hipertrofia, emagrecimento..." /></Field>
          <Field label="Data de início"><Input name="joinedAt" type="date" /></Field>
          <Field label="Frequência de treino">
            <Input name="workoutFrequencyDays" type="number" min={1} defaultValue={30} />
          </Field>
          <Field label="Frequência de dieta">
            <Input name="dietFrequencyDays" type="number" min={1} defaultValue={30} />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue="active">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </Select>
          </Field>
          <Field label="Observações"><Textarea name="notes" className="md:col-span-2" /></Field>
          {state.message ? (
            <p className={`rounded-lg px-3 py-2 text-sm font-semibold md:col-span-2 ${state.ok ? "bg-emerald/10 text-forest" : "bg-red-50 text-red-700"}`}>
              {state.message}
            </p>
          ) : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isPending} className="min-h-12 w-full md:w-auto">
              {isPending ? "Cadastrando aluno..." : "Cadastrar aluno"}
            </Button>
          </div>
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
              {students.length ? students.map((student) => (
                <tr key={student.id} className="border-t border-line">
                  <td className="py-3 font-bold">{student.name}<span className="block text-xs font-medium text-zinc-500">{student.email}</span></td>
                  <td>{student.goal}</td>
                  <td>{student.level}</td>
                  <td><Badge tone="success">Ativo</Badge></td>
                  <td>{formatDate(student.joinedAt)}</td>
                  <td className="text-right"><Button variant="secondary" type="button">Editar</Button></td>
                </tr>
              )) : (
                <tr className="border-t border-line">
                  <td className="py-4 text-sm font-semibold text-zinc-500" colSpan={6}>Nenhum aluno cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
