"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mail, Plus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createStudentAction,
  resendStudentAccessAction,
  type CreateStudentState,
  type StudentAccessState
} from "@/app/(app)/alunos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Student } from "@/types/domain";

const initialCreateState: CreateStudentState = { ok: false, message: "" };
const initialAccessState: StudentAccessState = { ok: false, message: "" };

function statusTone(status: Student["status"]) {
  if (status === "active") return "success";
  if (status === "blocked") return "danger";
  return "warning";
}

function statusLabel(status: Student["status"]) {
  if (status === "active") return "Ativo";
  if (status === "blocked") return "Bloqueado";
  return "Inativo";
}

export function StudentList({ students }: { students: Student[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [createState, createFormAction, isCreating] = useActionState(createStudentAction, initialCreateState);
  const [accessState, accessFormAction, isResendingAccess] = useActionState(resendStudentAccessAction, initialAccessState);

  useEffect(() => {
    if (!createState.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [createState.ok, router]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <Card className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald">Novo aluno</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Cadastrar aluno</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              Crie o acesso do aluno e envie um link seguro para ele definir a própria senha.
            </p>
          </div>
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-forest">
            <Plus className="h-6 w-6" />
          </span>
        </div>

        <form ref={formRef} action={createFormAction} className="mt-6 grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div className="min-w-0">
            <Field label="Nome completo">
              <Input name="fullName" placeholder="Nome completo" required />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="E-mail">
              <Input name="email" type="email" placeholder="aluno@email.com" required />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="Telefone">
              <Input name="phone" placeholder="(00) 00000-0000" />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="Data de nascimento">
              <Input name="birthDate" type="date" />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="Objetivo">
              <Input name="goal" placeholder="Hipertrofia, emagrecimento..." />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="Data de início">
              <Input name="joinedAt" type="date" />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="Frequência de treino">
              <Input name="workoutFrequencyDays" type="number" min={1} defaultValue={30} />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="Frequência de dieta">
              <Input name="dietFrequencyDays" type="number" min={1} defaultValue={30} />
            </Field>
          </div>
          <div className="min-w-0">
            <Field label="Status">
              <Select name="status" defaultValue="active">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </Select>
            </Field>
          </div>
          <div className="min-w-0 lg:col-span-2">
            <Field label="Observações">
              <Textarea name="notes" placeholder="Observações internas sobre o aluno" />
            </Field>
          </div>

          {createState.message ? (
            <p className={`rounded-lg px-4 py-3 text-sm font-semibold lg:col-span-2 ${createState.ok ? "bg-emerald/10 text-forest" : "bg-red-50 text-red-700"}`}>
              {createState.message}
            </p>
          ) : null}

          <div className="flex justify-end lg:col-span-2">
            <Button type="submit" disabled={isCreating} className="min-h-12 w-full px-6 sm:w-auto">
              {isCreating ? "Cadastrando aluno..." : "Cadastrar aluno"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">Alunos do Coach</h2>
            <p className="mt-1 text-sm text-zinc-500">{students.length ? `${students.length} aluno(s) cadastrado(s)` : "Nenhum aluno cadastrado."}</p>
          </div>
          {accessState.message ? (
            <p className={`rounded-lg px-4 py-3 text-sm font-semibold ${accessState.ok ? "bg-emerald/10 text-forest" : "bg-red-50 text-red-700"}`}>
              {accessState.message}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3">
          {students.length ? students.map((student) => (
            <article key={student.id} className="grid gap-4 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex min-w-0 gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-mist text-forest">
                  <UserRound className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-lg text-ink">{student.name}</strong>
                    <Badge tone={statusTone(student.status)}>{statusLabel(student.status)}</Badge>
                  </div>
                  <span className="mt-1 block break-words text-sm font-semibold text-zinc-500">{student.email}</span>
                  <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
                    <span><strong className="block text-xs uppercase text-zinc-400">Objetivo</strong>{student.goal || "Não informado"}</span>
                    <span><strong className="block text-xs uppercase text-zinc-400">Nível</strong>{student.level}</span>
                    <span><strong className="block text-xs uppercase text-zinc-400">Entrada</strong>{formatDate(student.joinedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:flex sm:justify-end">
                <Button variant="secondary" type="button" className="min-h-11">
                  Editar
                </Button>
                <form action={accessFormAction}>
                  <input type="hidden" name="studentId" value={student.id} />
                  <Button variant="secondary" type="submit" className="min-h-11 w-full" disabled={isResendingAccess}>
                    <Mail className="h-4 w-4" />
                    {isResendingAccess ? "Enviando..." : "Reenviar acesso"}
                  </Button>
                </form>
              </div>
            </article>
          )) : (
            <div className="rounded-lg border border-dashed border-line p-6 text-center">
              <UserRound className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 text-sm font-semibold text-zinc-500">Nenhum aluno cadastrado.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
