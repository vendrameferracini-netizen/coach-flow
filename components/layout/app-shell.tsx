import { Sidebar } from "@/components/layout/sidebar";
import type { UserRole } from "@/types/domain";

export function AppShell({ children, role = "coach", title }: { children: React.ReactNode; role?: UserRole; title: string }) {
  return (
    <div className="min-h-screen bg-mist lg:flex">
      <Sidebar role={role} />
      <main className="min-w-0 flex-1">
        <header className="border-b border-line bg-white/86 px-5 py-4 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald">CoachFlow</p>
              <h1 className="mt-1 text-2xl font-black text-ink">{title}</h1>
            </div>
            <div className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-coal">Português Brasil</div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
