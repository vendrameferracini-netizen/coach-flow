import Link from "next/link";
import { Activity, Dumbbell, Home, Soup, UserRound } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import type { UserRole } from "@/types/domain";

const studentMobileNav = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/treinos", label: "Treino", icon: Dumbbell },
  { href: "/dietas", label: "Dieta", icon: Soup },
  { href: "/avaliacoes", label: "Evolução", icon: Activity },
  { href: "/perfil", label: "Perfil", icon: UserRound }
];

export function AppShell({ children, role = "coach", title }: { children: React.ReactNode; role?: UserRole; title: string }) {
  return (
    <div className="min-h-screen bg-mist lg:flex">
      <Sidebar role={role} />
      <main className="min-w-0 flex-1">
        <header className={`${role === "student" ? "hidden lg:block" : ""} border-b border-line bg-white/86 px-5 py-4 backdrop-blur lg:px-8`}>
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
      {role === "student" ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-white/96 px-2 pb-2 pt-2 shadow-2xl backdrop-blur lg:hidden">
          {studentMobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="grid min-h-14 place-items-center gap-1 rounded-lg text-xs font-black text-zinc-500 transition hover:bg-mist hover:text-forest">
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
