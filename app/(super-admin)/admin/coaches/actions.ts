"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateCoachState = {
  ok: boolean;
  message: string;
};

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createCoachAction(_: CreateCoachState, formData: FormData): Promise<CreateCoachState> {
  await getAppSession(["super_admin"]);

  const fullName = getValue(formData, "fullName");
  const email = normalizeEmail(getValue(formData, "email"));
  const phone = getValue(formData, "phone");
  const cpf = getValue(formData, "cpf");
  const plan = getValue(formData, "plan") || "Starter";
  const status = getValue(formData, "status") === "inactive" ? "inactive" : "active";
  const notes = getValue(formData, "notes");

  if (!fullName || !email) {
    return { ok: false, message: "Informe nome completo e e-mail para criar o Coach." };
  }

  const admin = createAdminClient() as any;
  const { data: existingEmail, error: existingEmailError } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingEmailError) return { ok: false, message: "Nao foi possivel validar o e-mail informado." };
  if (existingEmail) return { ok: false, message: "Ja existe um acesso cadastrado com este e-mail." };

  if (cpf) {
    const { data: existingCpf, error: existingCpfError } = await admin
      .from("profiles")
      .select("id")
      .eq("cpf", cpf)
      .maybeSingle();

    if (existingCpfError) return { ok: false, message: "Nao foi possivel validar o CPF informado." };
    if (existingCpf) return { ok: false, message: "Ja existe um Coach cadastrado com este CPF." };
  }

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: "coach" }
  });

  if (inviteError || !inviteData.user) {
    return {
      ok: false,
      message: inviteError?.message || "Nao foi possivel criar o acesso do Coach no Supabase Auth."
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: inviteData.user.id,
    role: "coach",
    full_name: fullName,
    email,
    phone: phone || null,
    cpf: cpf || null,
    status,
    plan,
    notes: notes || null
  });

  if (profileError) {
    return {
      ok: false,
      message: "O usuario foi criado no Auth, mas nao foi possivel criar o profile. Verifique o Supabase antes de tentar novamente."
    };
  }

  revalidatePath("/admin/coaches");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Coach criado com sucesso. O convite para definir senha foi enviado pelo Supabase, se o envio de e-mail estiver configurado."
  };
}
