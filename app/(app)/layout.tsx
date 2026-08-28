import { AppShell } from "@/components/layout/app-shell";
import { getAppSession } from "@/lib/auth/session";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getAppSession(["super_admin", "coach", "student"]);
  const titleByRole = {
    super_admin: "Área do Super Admin",
    coach: "Área do Coach",
    student: "Área do Aluno"
  };

  return (
    <AppShell role={profile.role} title={titleByRole[profile.role]}>
      {children}
    </AppShell>
  );
}
