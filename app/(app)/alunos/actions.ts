"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateStudentState = {
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

  const admin = createAdminClient() as any;
  const { data: existingProfile, error: existingProfileError } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfileError) return { ok: false, message: "Nao foi possivel validar o e-mail informado." };
  if (existingProfile) return { ok: false, message: "Ja existe um acesso cadastrado com este e-mail." };

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: "student", coach_id: coach.id }
  });

  if (inviteError || !inviteData.user) {
    return {
      ok: false,
      message: inviteError?.message || "Nao foi possivel criar o acesso do aluno no Supabase Auth."
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: inviteData.user.id,
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

  const { error: studentError } = await admin.from("students").insert({
    coach_id: coach.id,
    auth_user_id: inviteData.user.id,
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
  });

  if (studentError) {
    return {
      ok: false,
      message: "O acesso foi criado, mas nao foi possivel cadastrar o aluno. Verifique o Supabase antes de tentar novamente."
    };
  }

  revalidatePath("/alunos");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Aluno cadastrado com sucesso. O convite para definir senha foi enviado pelo Supabase, se o envio de e-mail estiver configurado."
  };
}
