import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  Bell,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Soup,
  UserRound,
  UsersRound
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

const navByRole = {
  super_admin: [
    { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
    { href: "/admin/coaches", label: "Coaches", icon: ShieldCheck }
  ],
  coach: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/alunos", label: "Alunos", icon: UsersRound },
    { href: "/treinos", label: "Treinos", icon: Dumbbell },
    { href: "/dietas", label: "Dietas", icon: Soup },
    { href: "/avaliacoes", label: "Avaliações", icon: Activity },
    { href: "/protocolos", label: "Protocolos", icon: ClipboardList },
    { href: "/recados", label: "Recados", icon: MessageSquare },
    { href: "/alertas", label: "Alertas", icon: Bell }
  ],
  student: [
    { href: "/dashboard", label: "Meu painel", icon: LayoutDashboard },
    { href: "/treinos", label: "Treino", icon: Dumbbell },
    { href: "/dietas", label: "Dieta", icon: Soup },
    { href: "/avaliacoes", label: "Evolução", icon: Activity },
    { href: "/protocolos", label: "Protocolo", icon: ClipboardList },
    { href: "/recados", label: "Recados", icon: MessageSquare },
    { href: "/perfil", label: "Perfil", icon: UserRound }
  ]
} satisfies Record<UserRole, Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }>>;

export function Sidebar({ role = "coach" }: { role?: UserRole }) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 bg-forest p-5 text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/12 text-sm font-black">CF</div>
        <div>
          <strong className="block text-lg">CoachFlow</strong>
          <span className="text-xs text-white/60">SaaS de performance</span>
        </div>
      </div>
      <nav className="mt-8 grid gap-1">
        {navByRole[role].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto grid gap-3">
        <LogoutButton compact className="w-full justify-start" />
        <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-sm">
          <strong className="block">Ambiente seguro</strong>
          <span className="mt-1 block text-white/62">RLS, Auth e isolamento por Coach.</span>
        </div>
      </div>
    </aside>
  );
}
