"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateCoachState = {
  ok: boolean;
  message: string;
};

export type CoachMutationState = {
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

function getCoachStatus(formData: FormData) {
  const status = getValue(formData, "status");
  return status === "inactive" || status === "blocked" ? status : "active";
}

function isEmailRateLimitError(error: { message?: string } | null | undefined) {
  return error?.message?.toLowerCase().includes("email rate limit exceeded") || false;
}

function isInvalidEmail(email: string) {
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordRedirectUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (configuredUrl) {
    const origin = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
    return `${origin.replace(/\/$/, "")}/update-password`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Configure NEXT_PUBLIC_SITE_URL ou NEXT_PUBLIC_APP_URL para gerar links de acesso em produção.");
  }

  return "http://localhost:3000/update-password";
}

async function sendCoachPasswordAccess(admin: any, coachId: string, email: string) {
  const redirectTo = getPasswordRedirectUrl();
  console.info("[CoachFlow] Enviando acesso do Coach", {
    coachId,
    email,
    method: "resetPasswordForEmail",
    redirectTo
  });

  const result = await admin.auth.resetPasswordForEmail(email, { redirectTo });

  console.info("[CoachFlow] Resultado do envio de acesso do Coach", {
    coachId,
    email,
    method: "resetPasswordForEmail",
    success: !result.error,
    error: result.error ? "send_failed" : null
  });

  return result;
}

function revalidateCoachViews() {
  revalidatePath("/admin/coaches");
  revalidatePath("/dashboard");
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

  if (isInvalidEmail(email)) {
    return { ok: false, message: "Informe um e-mail válido para criar o Coach." };
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

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "coach" }
  });

  if (userError || !userData.user) {
    return {
      ok: false,
      message: userError?.message?.toLowerCase().includes("already")
        ? "Ja existe um usuario no Auth com este e-mail. Verifique o Supabase antes de tentar novamente."
        : "Nao foi possivel criar o acesso do Coach no Supabase Auth."
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
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

  let accessEmailError: { message?: string } | null = null;

  try {
    const { error } = await sendCoachPasswordAccess(admin, userData.user.id, email);
    accessEmailError = error;
  } catch {
    accessEmailError = { message: "missing_redirect_url" };
  }

  revalidateCoachViews();

  if (isEmailRateLimitError(accessEmailError)) {
    return {
      ok: true,
      message: "Coach criado, mas o limite temporário de envio de e-mails foi atingido. Aguarde alguns minutos e use \"Reenviar acesso\"."
    };
  }

  if (accessEmailError?.message === "missing_redirect_url") {
    return {
      ok: true,
      message: "Coach criado, mas a URL pública do CoachFlow não está configurada para enviar o link de acesso. Configure NEXT_PUBLIC_SITE_URL e use \"Reenviar acesso\"."
    };
  }

  if (accessEmailError) {
    return {
      ok: true,
      message: "Coach criado, mas nao foi possivel enviar o e-mail de acesso agora. Confira a configuração de e-mail do Supabase e use \"Reenviar acesso\"."
    };
  }

  return {
    ok: true,
    message: "Coach criado com sucesso. O convite para definir senha foi enviado pelo Supabase, se o envio de e-mail estiver configurado."
  };
}

export async function updateCoachAction(_: CoachMutationState, formData: FormData): Promise<CoachMutationState> {
  await getAppSession(["super_admin"]);

  const coachId = getValue(formData, "coachId");
  const fullName = getValue(formData, "fullName");
  const email = normalizeEmail(getValue(formData, "email"));
  const phone = getValue(formData, "phone");
  const cpf = getValue(formData, "cpf");
  const plan = getValue(formData, "plan") || "Starter";
  const status = getCoachStatus(formData);
  const notes = getValue(formData, "notes");

  if (!coachId || !fullName || !email) {
    return { ok: false, message: "Informe Coach, nome completo e e-mail para salvar as alterações." };
  }

  if (isInvalidEmail(email)) {
    return { ok: false, message: "Informe um e-mail válido para salvar o Coach." };
  }

  const admin = createAdminClient() as any;
  const { data: currentCoach, error: currentCoachError } = await admin
    .from("profiles")
    .select("id, email, role")
    .eq("id", coachId)
    .eq("role", "coach")
    .maybeSingle();

  if (currentCoachError) return { ok: false, message: "Nao foi possivel localizar o Coach para edição." };
  if (!currentCoach) return { ok: false, message: "Coach nao encontrado ou nao permitido para edição." };

  const { data: existingEmail, error: existingEmailError } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .neq("id", coachId)
    .maybeSingle();

  if (existingEmailError) return { ok: false, message: "Nao foi possivel validar o e-mail informado." };
  if (existingEmail) return { ok: false, message: "Ja existe outro acesso cadastrado com este e-mail." };

  if (cpf) {
    const { data: existingCpf, error: existingCpfError } = await admin
      .from("profiles")
      .select("id")
      .eq("cpf", cpf)
      .neq("id", coachId)
      .maybeSingle();

    if (existingCpfError) return { ok: false, message: "Nao foi possivel validar o CPF informado." };
    if (existingCpf) return { ok: false, message: "Ja existe outro Coach cadastrado com este CPF." };
  }

  const previousEmail = currentCoach.email;
  const emailChanged = previousEmail !== email;

  if (emailChanged) {
    const { error: authError } = await admin.auth.admin.updateUserById(coachId, {
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "coach" }
    });

    if (authError) {
      return { ok: false, message: "Nao foi possivel atualizar o e-mail no Supabase Auth. Verifique se o e-mail ja esta em uso." };
    }
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      email,
      phone: phone || null,
      cpf: cpf || null,
      plan,
      status,
      notes: notes || null
    })
    .eq("id", coachId)
    .eq("role", "coach");

  if (profileError) {
    if (emailChanged) {
      await admin.auth.admin.updateUserById(coachId, { email: previousEmail });
    }

    return {
      ok: false,
      message: "Nao foi possivel salvar o profile. Se o e-mail foi alterado, o sistema tentou restaurar o e-mail anterior no Auth."
    };
  }

  if (!emailChanged) {
    await admin.auth.admin.updateUserById(coachId, {
      user_metadata: { full_name: fullName, role: "coach" }
    });
  }

  revalidateCoachViews();
  return { ok: true, message: "Coach atualizado com sucesso." };
}

export async function setCoachStatusAction(_: CoachMutationState, formData: FormData): Promise<CoachMutationState> {
  await getAppSession(["super_admin"]);

  const coachId = getValue(formData, "coachId");
  const nextStatus = getCoachStatus(formData);

  if (!coachId) return { ok: false, message: "Coach nao informado." };

  const admin = createAdminClient() as any;
  const { error } = await admin
    .from("profiles")
    .update({ status: nextStatus })
    .eq("id", coachId)
    .eq("role", "coach");

  if (error) return { ok: false, message: "Nao foi possivel atualizar o status do Coach." };

  revalidateCoachViews();
  return { ok: true, message: nextStatus === "active" ? "Coach reativado com sucesso." : "Coach bloqueado com sucesso." };
}

export async function resendCoachAccessAction(_: CoachMutationState, formData: FormData): Promise<CoachMutationState> {
  await getAppSession(["super_admin"]);

  const coachId = getValue(formData, "coachId");
  if (!coachId) return { ok: false, message: "Coach nao informado." };

  const admin = createAdminClient() as any;
  const { data: coach, error: coachError } = await admin
    .from("profiles")
    .select("id, email, role")
    .eq("id", coachId)
    .eq("role", "coach")
    .maybeSingle();

  if (coachError) return { ok: false, message: "Nao foi possivel localizar o Coach." };
  if (!coach) return { ok: false, message: "Coach nao encontrado." };

  const profileEmail = normalizeEmail(coach.email || "");
  if (isInvalidEmail(profileEmail)) {
    console.info("[CoachFlow] Reenvio de acesso bloqueado por e-mail inválido", {
      coachId,
      email: profileEmail,
      method: "resetPasswordForEmail",
      success: false,
      error: "invalid_email"
    });

    return { ok: false, message: "O e-mail atual do Coach é inválido. Corrija o cadastro antes de reenviar o acesso." };
  }

  console.info("[CoachFlow] Buscando usuário Auth do Coach para reenvio", {
    coachId,
    method: "getUserById"
  });

  const { data: authUserData, error: authUserError } = await admin.auth.admin.getUserById(coachId);
  const authEmail = normalizeEmail(authUserData?.user?.email || "");

  if (authUserError || !authUserData?.user) {
    console.info("[CoachFlow] Usuário Auth do Coach não encontrado para reenvio", {
      coachId,
      email: profileEmail,
      method: "getUserById",
      success: false,
      error: "auth_user_not_found"
    });

    return { ok: false, message: "Usuário de autenticação do Coach não encontrado. Verifique o vínculo antes de reenviar o acesso." };
  }

  if (authEmail !== profileEmail) {
    console.info("[CoachFlow] Sincronizando e-mail do Coach antes do reenvio", {
      coachId,
      email: profileEmail,
      method: "updateUserById",
      success: null,
      error: null
    });

    const { error: syncError } = await admin.auth.admin.updateUserById(coachId, {
      email: profileEmail,
      email_confirm: true,
      user_metadata: { role: "coach" }
    });

    if (syncError) {
      console.info("[CoachFlow] Falha ao sincronizar e-mail do Coach antes do reenvio", {
        coachId,
        email: profileEmail,
        method: "updateUserById",
        success: false,
        error: "sync_failed"
      });

      return { ok: false, message: "Auth e Profile estão com e-mails divergentes e não foi possível sincronizar automaticamente. Verifique se o e-mail já está em uso." };
    }
  }

  const { data: confirmedAuthUserData, error: confirmedAuthUserError } = await admin.auth.admin.getUserById(coachId);
  const confirmedAuthEmail = normalizeEmail(confirmedAuthUserData?.user?.email || "");

  if (confirmedAuthUserError || confirmedAuthEmail !== profileEmail) {
    console.info("[CoachFlow] E-mail do Coach segue divergente após sincronização", {
      coachId,
      email: profileEmail,
      method: "getUserById",
      success: false,
      error: "email_mismatch"
    });

    return { ok: false, message: "Auth e Profile ainda estão com e-mails divergentes. O acesso não foi reenviado para evitar envio incorreto." };
  }

  let error: { message?: string } | null = null;

  try {
    const result = await sendCoachPasswordAccess(admin, coachId, profileEmail);
    error = result.error;
  } catch {
    return {
      ok: false,
      message: "Nao foi possivel gerar o link de acesso porque a URL pública do CoachFlow não está configurada. Configure NEXT_PUBLIC_SITE_URL na Vercel."
    };
  }

  if (isEmailRateLimitError(error)) {
    return {
      ok: false,
      message: "O limite temporário de envio de e-mails foi atingido. Aguarde alguns minutos e tente reenviar o acesso novamente."
    };
  }

  if (error) {
    return { ok: false, message: "Nao foi possivel reenviar o convite de acesso agora. Verifique a configuração de e-mail do Supabase." };
  }

  return { ok: true, message: `Acesso enviado para ${profileEmail}.` };
}
