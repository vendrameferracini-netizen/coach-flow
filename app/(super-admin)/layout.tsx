import { AppShell } from "@/components/layout/app-shell";
import { getAppSession } from "@/lib/auth/session";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await getAppSession(["super_admin"]);
  return (
    <AppShell role="super_admin" title="Super Admin">
      {children}
    </AppShell>
  );
}
