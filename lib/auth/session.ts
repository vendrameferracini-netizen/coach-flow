import { redirect } from "next/navigation";
import { isUserRole } from "@/lib/auth/redirects";
import { isDemoModeEnabled } from "@/lib/config/demo";
import { createClient } from "@/lib/supabase/server";
import { demoProfiles } from "@/lib/data/demo";
import type { Profile, UserRole } from "@/types/domain";

export type AppSession = {
  profile: Profile;
  isDemo: boolean;
};

type ProfileRow = {
  id: string;
  role: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  status: "active" | "inactive" | "blocked";
  plan: string | null;
  coach_id: string | null;
  created_at: string;
  notes: string | null;
};

function mapProfile(profile: ProfileRow): Profile | null {
  if (!isUserRole(profile.role)) return null;

  return {
    id: profile.id,
    role: profile.role,
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone || undefined,
    cpf: profile.cpf || undefined,
    status: profile.status,
    plan: profile.plan || undefined,
    coachId: profile.coach_id || undefined,
    createdAt: profile.created_at,
    notes: profile.notes || undefined
  };
}

export async function getAppSession(requiredRoles?: UserRole[]): Promise<AppSession> {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const demoEnabled = isDemoModeEnabled();

  if (!hasSupabase && demoEnabled) {
    const role = (process.env.NEXT_PUBLIC_DEMO_ROLE as UserRole | undefined) || "coach";
    const profile = demoProfiles.find((item) => item.role === role) || demoProfiles[1];
    if (requiredRoles?.length && !requiredRoles.includes(profile.role)) redirect("/dashboard");
    return { profile, isDemo: true };
  }

  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, phone, cpf, status, plan, coach_id, created_at, notes")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login?error=profile_not_linked");

  const mappedProfile = mapProfile(profile);
  if (!mappedProfile || mappedProfile.status !== "active") redirect("/login?error=profile_not_linked");

  if (requiredRoles?.length && !requiredRoles.includes(mappedProfile.role)) redirect("/dashboard");
  return { profile: mappedProfile, isDemo: false };
}
