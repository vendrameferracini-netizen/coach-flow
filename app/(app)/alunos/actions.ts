"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateStudentState = {
  ok: boolean;
  message: string;
};

export type StudentAccessState = {
  ok: boolean;
  message: string;
};

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getPositiveInteger(formData: FormData, key: string, fallback: number) {
  const value = Number(getValue(formData, key));
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isInvalidEmail(email: string) {
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isEmailRateLimitError(error: { message?: string } | null | undefined) {
  return error?.message?.toLowerCase().includes("email rate limit exceeded") || false;
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

async function sendStudentPasswordAccess(admin: any, studentId: string, authUserId: string, email: string) {
  const redirectTo = getPasswordRedirectUrl();
  console.info("[CoachFlow] Enviando acesso do Aluno", {
    studentId,
    authUserId,
    email,
    method: "resetPasswordForEmail",
    redirectTo
  });

  const result = await admin.auth.resetPasswordForEmail(email, { redirectTo });

  console.info("[CoachFlow] Resultado do envio de acesso do Aluno", {
    studentId,
    authUserId,
    email,
    method: "resetPasswordForEmail",
    success: !result.error,
    error: result.error ? "send_failed" : null
  });

  return result;
}

export async function createStudentAction(_: CreateStudentState, formData: FormData): Promise<CreateStudentState> {
  const { profile: coach } = await getAppSession(["coach"]);

  const fullName = getValue(formData, "fullName");
  const email = normalizeEmail(getValue(formData, "email"));
  const phone = getValue(formData, "phone");
  const birthDate = getValue(formData, "birthDate");
  const goal = getValue(formData, "goal");
  const joinedAt = getValue(formData, "joinedAt");
  const workoutFrequencyDays = getPositiveInteger(formData, "workoutFrequencyDays", 30);
  const dietFrequencyDays = getPositiveInteger(formData, "dietFrequencyDays", 30);
  const status = getValue(formData, "status") === "inactive" ? "inactive" : "active";
  const notes = getValue(formData, "notes");

  if (!fullName || !email) {
    return { ok: false, message: "Informe nome completo e e-mail para cadastrar o aluno." };
  }

  if (isInvalidEmail(email)) {
    return { ok: false, message: "Informe um e-mail válido para cadastrar o aluno." };
  }

  const admin = createAdminClient() as any;
  const { data: existingProfile, error: existingProfileError } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfileError) return { ok: false, message: "Nao foi possivel validar o e-mail informado." };
  if (existingProfile) return { ok: false, message: "Ja existe um acesso cadastrado com este e-mail." };

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "student", coach_id: coach.id }
  });

  if (userError || !userData.user) {
    return {
      ok: false,
      message: userError?.message?.toLowerCase().includes("already")
        ? "Ja existe um usuário no Auth com este e-mail. Verifique o Supabase antes de tentar novamente."
        : "Nao foi possivel criar o acesso do aluno no Supabase Auth."
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
    role: "student",
    full_name: fullName,
    email,
    phone: phone || null,
    status,
    coach_id: coach.id,
    notes: notes || null
  });

  if (profileError) {
    return {
      ok: false,
      message: "O usuario foi criado no Auth, mas nao foi possivel criar o profile do aluno. Verifique o Supabase antes de tentar novamente."
    };
  }

  const { data: studentData, error: studentError } = await admin
    .from("students")
    .insert({
      coach_id: coach.id,
      auth_user_id: userData.user.id,
      name: fullName,
      email,
      phone: phone || null,
      birth_date: birthDate || null,
      goal: goal || null,
      status,
      notes: notes || null,
      joined_at: joinedAt || new Date().toISOString().slice(0, 10),
      diet_frequency_days: dietFrequencyDays,
      workout_frequency_days: workoutFrequencyDays
    })
    .select("id")
    .single();

  if (studentError) {
    return {
      ok: false,
      message: "O acesso foi criado, mas nao foi possivel cadastrar o aluno. Verifique o Supabase antes de tentar novamente."
    };
  }

  revalidatePath("/alunos");
  revalidatePath("/dashboard");

  let accessEmailError: { message?: string } | null = null;

  try {
    const { error } = await sendStudentPasswordAccess(admin, studentData.id, userData.user.id, email);
    accessEmailError = error;
  } catch {
    accessEmailError = { message: "missing_redirect_url" };
  }

  if (isEmailRateLimitError(accessEmailError)) {
    return {
      ok: true,
      message: "Aluno cadastrado com sucesso, mas o limite temporário de envio de e-mails foi atingido. Aguarde alguns minutos e reenvie o acesso."
    };
  }

  if (accessEmailError?.message === "missing_redirect_url") {
    return {
      ok: true,
      message: "Aluno cadastrado com sucesso, mas a URL pública do CoachFlow não está configurada para enviar o link de acesso."
    };
  }

  if (accessEmailError) {
    return {
      ok: true,
      message: "Aluno cadastrado com sucesso, mas nao foi possivel enviar o e-mail de acesso agora. Tente reenviar o acesso em alguns minutos."
    };
  }

  return {
    ok: true,
    message: "Aluno cadastrado com sucesso. O link para definir senha foi enviado por e-mail."
  };
}

export async function resendStudentAccessAction(_: StudentAccessState, formData: FormData): Promise<StudentAccessState> {
  const { profile: coach } = await getAppSession(["coach"]);
  const studentId = getValue(formData, "studentId");

  if (!studentId) return { ok: false, message: "Aluno não informado." };

  const admin = createAdminClient() as any;
  const { data: student, error: studentError } = await admin
    .from("students")
    .select("id, coach_id, auth_user_id, email")
    .eq("id", studentId)
    .eq("coach_id", coach.id)
    .maybeSingle();

  if (studentError) return { ok: false, message: "Nao foi possivel localizar o aluno." };
  if (!student) return { ok: false, message: "Aluno não encontrado ou não pertence ao Coach autenticado." };
  if (!student.auth_user_id) return { ok: false, message: "Este aluno ainda não possui usuário de acesso vinculado." };

  console.info("[CoachFlow] Buscando usuário Auth do Aluno para reenvio", {
    studentId,
    authUserId: student.auth_user_id,
    method: "getUserById"
  });

  const { data: authUserData, error: authUserError } = await admin.auth.admin.getUserById(student.auth_user_id);
  const authEmail = normalizeEmail(authUserData?.user?.email || "");

  if (authUserError || !authUserData?.user) {
    return { ok: false, message: "Usuário de autenticação do aluno não encontrado. Verifique o vínculo antes de reenviar o acesso." };
  }

  if (isInvalidEmail(authEmail)) {
    return { ok: false, message: "O e-mail atual do aluno no Auth é inválido. Corrija o cadastro antes de reenviar o acesso." };
  }

  let accessEmailError: { message?: string } | null = null;

  try {
    const { error } = await sendStudentPasswordAccess(admin, student.id, student.auth_user_id, authEmail);
    accessEmailError = error;
  } catch {
    return {
      ok: false,
      message: "Nao foi possivel gerar o link de acesso porque a URL pública do CoachFlow não está configurada."
    };
  }

  if (isEmailRateLimitError(accessEmailError)) {
    return {
      ok: false,
      message: "O limite temporário de envio de e-mails foi atingido. Aguarde alguns minutos e tente novamente."
    };
  }

  if (accessEmailError) {
    return { ok: false, message: "Nao foi possivel reenviar o acesso agora. Verifique a configuração de e-mail do Supabase." };
  }

  return { ok: true, message: `Acesso enviado para ${authEmail}.` };
}
