"use client";

import { useEffect, useState, useTransition } from "react";
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
  const [ready, setReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function prepareRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorCode = params.get("error_code") || hashParams.get("error_code") || params.get("error") || hashParams.get("error");

      if (errorCode) {
        setMessage("Link expirado ou inválido. Solicite um novo acesso.");
        setReady(false);
        return;
      }

      const code = params.get("code");
      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage("Link expirado ou inválido. Solicite um novo acesso.");
          setReady(false);
          return;
        }
      }

      setReady(true);
    }

    prepareRecoverySession();
  }, []);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const password = String(formData.get("password") || "");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error ? "Link expirado ou inválido. Solicite um novo acesso." : "Senha alterada com sucesso.");
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <Field label="Nova senha">
        <Input name="password" type="password" minLength={8} autoComplete="new-password" required />
      </Field>
      {message ? <p className="rounded-lg bg-emerald/10 px-3 py-2 text-sm font-semibold text-emerald">{message}</p> : null}
      <Button type="submit" disabled={isPending || !ready}>{isPending ? "Salvando..." : "Alterar senha"}</Button>
    </form>
  );
}
