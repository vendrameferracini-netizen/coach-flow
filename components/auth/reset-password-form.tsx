"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const [messageTone, setMessageTone] = useState<"success" | "error" | "neutral">("neutral");
  const [ready, setReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function showInvalidLinkMessage() {
    setMessageTone("error");
    setMessage("Link expirado ou inválido. Solicite um novo acesso.");
    setReady(false);
  }

  useEffect(() => {
    async function prepareRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const errorCode = params.get("error_code") || hashParams.get("error_code") || params.get("error") || hashParams.get("error");

      if (errorCode) {
        showInvalidLinkMessage();
        return;
      }

      const supabase = createClient();
      const type = params.get("type") || hashParams.get("type");
      const code = params.get("code") || hashParams.get("code");
      const tokenHash = params.get("token_hash") || hashParams.get("token_hash");
      const accessToken = hashParams.get("access_token") || params.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || params.get("refresh_token");

      setMessageTone("neutral");
      setMessage("Validando link de acesso...");

      if (type && type !== "recovery") {
        showInvalidLinkMessage();
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          showInvalidLinkMessage();
          return;
        }
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        if (error) {
          showInvalidLinkMessage();
          return;
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) {
          showInvalidLinkMessage();
          return;
        }
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        showInvalidLinkMessage();
        return;
      }

      window.history.replaceState(null, "", "/update-password");
      setMessage("");
      setMessageTone("neutral");
      setReady(true);
    }

    prepareRecoverySession();
  }, []);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const password = String(formData.get("password") || "");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        showInvalidLinkMessage();
        return;
      }

      await supabase.auth.signOut();
      setMessageTone("success");
      setMessage("Senha alterada com sucesso. Redirecionando para o login...");
      setReady(false);
      router.replace("/login");
    });
  }

  const messageClassName = {
    success: "bg-emerald/10 text-emerald",
    error: "bg-red-50 text-red-700",
    neutral: "bg-mist text-zinc-600"
  }[messageTone];

  return (
    <form action={handleSubmit} className="grid gap-4">
      <Field label="Nova senha">
        <Input name="password" type="password" minLength={8} autoComplete="new-password" required />
      </Field>
      {message ? <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${messageClassName}`}>{message}</p> : null}
      <Button type="submit" disabled={isPending || !ready}>{isPending ? "Salvando..." : "Alterar senha"}</Button>
    </form>
  );
}
