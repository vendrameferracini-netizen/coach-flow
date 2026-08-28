import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/reset-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
      <h2 className="text-3xl font-black text-ink">Recuperar senha</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">Enviaremos um link seguro para criar uma nova senha.</p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <Link href="/login" className="mt-5 block text-center text-sm font-semibold text-emerald">Voltar para login</Link>
    </div>
  );
}
