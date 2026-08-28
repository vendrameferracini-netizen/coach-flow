import { LoginForm } from "@/components/auth/login-form";
import { isDemoModeEnabled } from "@/lib/config/demo";

export default function LoginPage() {
  const demoMode = isDemoModeEnabled();

  return (
    <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald">Acesso seguro</p>
      <h2 className="mt-3 text-3xl font-black text-ink">Entrar</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">Use seu e-mail e senha para acessar a plataforma.</p>
      <div className="mt-6">
        <LoginForm demoMode={demoMode} />
      </div>
    </div>
  );
}
