"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCoachAction,
  resendCoachAccessAction,
  setCoachStatusAction,
  updateCoachAction,
  type CoachMutationState,
  type CreateCoachState
} from "@/app/(super-admin)/admin/coaches/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/domain";

const initialState: CreateCoachState = { ok: false, message: "" };
const initialMutationState: CoachMutationState = { ok: false, message: "" };

export function CoachManagement({ coaches }: { coaches: Profile[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);
  const [editingCoach, setEditingCoach] = useState<Profile | null>(null);
  const [state, formAction, isPending] = useActionState(createCoachAction, initialState);
  const [updateState, updateFormAction, isUpdating] = useActionState(updateCoachAction, initialMutationState);
  const [statusState, statusFormAction, isChangingStatus] = useActionState(setCoachStatusAction, initialMutationState);
  const [accessState, accessFormAction, isResendingAccess] = useActionState(resendCoachAccessAction, initialMutationState);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [router, state.ok]);

  useEffect(() => {
    if (!updateState.ok) return;
    setEditingCoach(null);
    router.refresh();
  }, [router, updateState.ok]);

  useEffect(() => {
    if (!statusState.ok && !accessState.ok) return;
    router.refresh();
  }, [accessState.ok, router, statusState.ok]);

  const feedbackMessage = updateState.message || statusState.message || accessState.message;
  const feedbackOk = updateState.message ? updateState.ok : statusState.message ? statusState.ok : accessState.ok;

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Coaches cadastrados</h2>
            <p className="mt-1 text-sm text-zinc-500">Edite, bloqueie ou reenvie o acesso do Coach com segurança.</p>
          </div>
          {feedbackMessage ? (
            <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${feedbackOk ? "bg-emerald/10 text-forest" : "bg-red-50 text-red-700"}`}>
              {feedbackMessage}
            </p>
          ) : null}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr><th className="py-3">Coach</th><th>CPF</th><th>Plano</th><th>Status</th><th>Criação</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {coaches.length ? coaches.map((coach) => (
                <tr key={coach.id} className="border-t border-line">
                  <td className="py-3 font-bold">{coach.fullName}<span className="block text-xs font-medium text-zinc-500">{coach.email}</span></td>
                  <td>{coach.cpf || "-"}</td>
                  <td>{coach.plan || "-"}</td>
                  <td><Badge tone={coach.status === "active" ? "success" : "danger"}>{coach.status === "active" ? "Ativo" : coach.status === "blocked" ? "Bloqueado" : "Inativo"}</Badge></td>
                  <td>{formatDate(coach.createdAt.slice(0, 10))}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setEditingCoach(coach)}>
                        Editar
                      </Button>
                      <form action={statusFormAction}>
                        <input type="hidden" name="coachId" value={coach.id} />
                        <input type="hidden" name="status" value={coach.status === "active" ? "blocked" : "active"} />
                        <Button type="submit" variant={coach.status === "active" ? "danger" : "secondary"} disabled={isChangingStatus}>
                          {coach.status === "active" ? "Bloquear" : "Reativar"}
                        </Button>
                      </form>
                      <form action={accessFormAction}>
                        <input type="hidden" name="coachId" value={coach.id} />
                        <Button type="submit" variant="secondary" disabled={isResendingAccess}>
                          Reenviar acesso
                        </Button>
                      </form>
                    </div>
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

      {editingCoach ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-soft sm:max-w-2xl sm:rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Editar Coach</h2>
                <p className="mt-1 text-sm text-zinc-500">As alterações usam o UUID real do profile/Auth.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setEditingCoach(null)}>
                Cancelar
              </Button>
            </div>

            <form ref={editFormRef} action={updateFormAction} className="mt-5 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="coachId" value={editingCoach.id} />
              <Field label="Nome completo">
                <Input name="fullName" defaultValue={editingCoach.fullName} required />
              </Field>
              <Field label="E-mail">
                <Input name="email" type="email" defaultValue={editingCoach.email} required />
              </Field>
              <Field label="Telefone">
                <Input name="phone" defaultValue={editingCoach.phone || ""} />
              </Field>
              <Field label="CPF">
                <Input name="cpf" defaultValue={editingCoach.cpf || ""} />
              </Field>
              <Field label="Plano">
                <Select name="plan" defaultValue={editingCoach.plan || "Starter"}>
                  <option>Starter</option>
                  <option>Pro</option>
                  <option>Scale</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue={editingCoach.status}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </Select>
              </Field>
              <Field label="Observações">
                <Textarea name="notes" defaultValue={editingCoach.notes || ""} className="md:col-span-2" />
              </Field>
              {updateState.message && !updateState.ok ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 md:col-span-2">
                  {updateState.message}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setEditingCoach(null)} className="min-h-12">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating} className="min-h-12">
                  {isUpdating ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
