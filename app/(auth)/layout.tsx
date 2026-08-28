export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-mist">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between bg-forest p-8 text-white lg:p-14">
          <div>
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/12 font-black">CF</div>
            <h1 className="mt-8 max-w-xl text-5xl font-black leading-none lg:text-7xl">CoachFlow</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
              Plataforma premium para personal trainers e coaches escalarem atendimento com segurança, organização e dados isolados por cliente.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/72 md:grid-cols-3">
            <span className="rounded-lg border border-white/15 p-3">Supabase Auth</span>
            <span className="rounded-lg border border-white/15 p-3">RLS por Coach</span>
            <span className="rounded-lg border border-white/15 p-3">Vercel Ready</span>
          </div>
        </section>
        <section className="grid place-items-center p-5">
          {children}
        </section>
      </div>
    </main>
  );
}
