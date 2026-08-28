"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const email = String(formData.get("email") || "");
      const redirectTo = `${window.location.origin}/update-password`;
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      setMessage("Se o e-mail existir, enviaremos as instruções de recuperação.");
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <Field label="E-mail">
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      {message ? <p className="rounded-lg bg-emerald/10 px-3 py-2 text-sm font-semibold text-emerald">{message}</p> : null}
      <Button type="submit" disabled={isPending}>{isPending ? "Enviando..." : "Enviar recuperação"}</Button>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const password = String(formData.get("password") || "");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error ? "Não foi possível alterar a senha." : "Senha alterada com sucesso.");
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <Field label="Nova senha">
        <Input name="password" type="password" minLength={8} autoComplete="new-password" required />
      </Field>
      {message ? <p className="rounded-lg bg-emerald/10 px-3 py-2 text-sm font-semibold text-emerald">{message}</p> : null}
      <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Alterar senha"}</Button>
    </form>
  );
}
