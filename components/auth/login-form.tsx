"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardPathByRole, isUserRole } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { UserRole } from "@/types/domain";

const demoAccesses: Array<{ label: string; role: UserRole; email: string; password: string }> = [
  { label: "Super Admin", role: "super_admin", email: "admin@coachflow.com", password: "123456" },
  { label: "Coach", role: "coach", email: "coach@coachflow.com", password: "123456" },
  { label: "Aluno", role: "student", email: "aluno@coachflow.com", password: "123456" }
];

type ProfileAccessRow = {
  role: string;
  status: string;
};

export function LoginForm({ demoMode = false }: { demoMode?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(demoMode ? "coach@coachflow.com" : "");
  const [password, setPassword] = useState(demoMode ? "123456" : "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      setError("");

      try {
        const supabase = createClient();
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        const profileResult = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", data.user.id)
          .maybeSingle() as { data: ProfileAccessRow | null; error: Error | null };

        let profile = profileResult.data;
        let profileError = profileResult.error;

        if (!profile && !profileError && data.user.email) {
          const fallback = await supabase
            .from("profiles")
            .select("role, status")
            .eq("email", data.user.email.toLowerCase())
            .maybeSingle() as { data: ProfileAccessRow | null; error: Error | null };
          profile = fallback.data;
          profileError = fallback.error;
        }

        if (profileError || !profile || !isUserRole(profile.role)) {
          await supabase.auth.signOut();
          setError("Perfil de acesso nao encontrado. Verifique a tabela profiles no Supabase.");
          return;
        }

        if (profile.status !== "active") {
          await supabase.auth.signOut();
          setError("Este acesso esta inativo ou bloqueado.");
          return;
        }

        router.replace(getDashboardPathByRole(profile.role));
        router.refresh();
      } catch {
        setError("Nao foi possivel entrar. Confira e-mail e senha.");
      }
    });
  }

  return (
    <div className="grid gap-5">
      {demoMode ? <div className="grid gap-3 rounded-xl border border-line bg-mist/40 p-3">
        <div>
          <p className="text-sm font-bold text-forest">Acessos de demonstracao</p>
          <p className="text-xs font-medium text-steel">Selecione um perfil para preencher o login.</p>
        </div>
        <div className="grid gap-2">
          {demoAccesses.map((access) => (
            <button
              className="grid gap-1 rounded-lg border border-line bg-white p-3 text-left transition hover:border-emerald hover:bg-emerald/5"
              key={access.role}
              onClick={() => {
                setEmail(access.email);
                setPassword(access.password);
                setError("");
              }}
              type="button"
            >
              <span className="text-sm font-bold text-coal">{access.label}</span>
              <span className="text-xs font-semibold text-steel">{access.email}</span>
              <span className="text-xs font-semibold text-steel">Senha: {access.password}</span>
            </button>
          ))}
        </div>
      </div> : null}

      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Field label="E-mail">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Senha">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
        <Link href="/forgot-password" className="text-center text-sm font-semibold text-emerald hover:text-forest">
          Esqueci minha senha
        </Link>
      </form>
    </div>
  );
}
