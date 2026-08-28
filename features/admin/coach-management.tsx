"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCoachAction, type CreateCoachState } from "@/app/(super-admin)/admin/coaches/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/domain";

const initialState: CreateCoachState = { ok: false, message: "" };

export function CoachManagement({ coaches }: { coaches: Profile[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createCoachAction, initialState);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [router, state.ok]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <h2 className="text-xl font-black">Criar Coach</h2>
        <p className="mt-1 text-sm text-zinc-500">Crie o acesso do Coach e envie um convite seguro para definir senha.</p>
        <form ref={formRef} action={formAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nome completo"><Input name="fullName" placeholder="Nome completo" required /></Field>
          <Field label="Telefone"><Input name="phone" placeholder="(00) 00000-0000" /></Field>
          <Field label="E-mail"><Input name="email" type="email" placeholder="coach@email.com" required /></Field>
          <Field label="CPF"><Input name="cpf" placeholder="000.000.000-00" /></Field>
          <Field label="Status">
            <Select name="status" defaultValue="active">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </Select>
          </Field>
          <Field label="Plano">
            <Select name="plan" defaultValue="Starter">
              <option>Starter</option>
              <option>Pro</option>
              <option>Scale</option>
            </Select>
          </Field>
          <Field label="Observações"><Textarea name="notes" className="md:col-span-2" /></Field>
          {state.message ? (
            <p className={`rounded-lg px-3 py-2 text-sm font-semibold md:col-span-2 ${state.ok ? "bg-emerald/10 text-forest" : "bg-red-50 text-red-700"}`}>
              {state.message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" disabled={isPending} className="min-h-12 w-full md:w-auto">
              {isPending ? "Criando Coach..." : "Criar Coach"}
            </Button>
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
              {coaches.length ? coaches.map((coach) => (
                <tr key={coach.id} className="border-t border-line">
                  <td className="py-3 font-bold">{coach.fullName}<span className="block text-xs font-medium text-zinc-500">{coach.email}</span></td>
                  <td>{coach.cpf}</td>
                  <td>{coach.plan}</td>
                  <td><Badge tone={coach.status === "active" ? "success" : "danger"}>{coach.status === "active" ? "Ativo" : "Inativo"}</Badge></td>
                  <td>{formatDate(coach.createdAt.slice(0, 10))}</td>
                  <td className="flex justify-end gap-2 py-3">
                    <Button type="button" variant="secondary">Editar</Button>
                    <Button type="button" variant="danger">Bloquear</Button>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-line">
                  <td className="py-4 text-sm font-semibold text-zinc-500" colSpan={6}>Nenhum Coach cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
