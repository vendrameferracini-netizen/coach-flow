import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAppSession } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { profile } = await getAppSession(["coach", "student"]);
  return (
    <Card className="max-w-3xl">
      <h2 className="text-xl font-black">Perfil</h2>
      <p className="mt-1 text-sm text-zinc-500">Dados da conta autenticada.</p>
      <form className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Nome"><Input defaultValue={profile.fullName} /></Field>
        <Field label="E-mail"><Input defaultValue={profile.email} disabled /></Field>
        <Field label="Telefone"><Input defaultValue={profile.phone} /></Field>
        <Field label="Status"><Input defaultValue={profile.status} disabled /></Field>
        <Field label="Observações"><Textarea defaultValue={profile.notes} /></Field>
        <div className="md:col-span-2"><Button type="button">Salvar perfil</Button></div>
      </form>
    </Card>
  );
}
