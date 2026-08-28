import { UpdatePasswordForm } from "@/components/auth/reset-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
      <h2 className="text-3xl font-black text-ink">Alterar senha</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">Defina uma nova senha para continuar usando o CoachFlow.</p>
      <div className="mt-6">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
