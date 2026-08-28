# CoachFlow

Primeira versão funcional do **CoachFlow**, um SaaS para Personal Trainers e Coaches com Next.js 15, React, TypeScript, Tailwind CSS, Supabase Auth, RLS e deploy preparado para Vercel.

## Arquitetura

- `app/`: rotas Next.js App Router.
- `components/`: componentes reutilizáveis de UI, layout e autenticação.
- `features/`: módulos de negócio por domínio.
- `lib/supabase`: clientes Supabase para browser, server e middleware.
- `lib/auth`: sessão, proteção de rotas e papel do usuário.
- `lib/data`: dados de demonstração isolados.
- `types`: contratos TypeScript.
- `supabase/migrations`: schema SQL de produção.
- `supabase/seed.sql`: seed de demonstração.
- `supabase/docs`: documentação SQL/RLS.

## O que foi implementado

- Base Next.js 15 com TypeScript e Tailwind CSS.
- Visual minimalista, premium, moderno e responsivo.
- Login com Supabase Auth.
- Esqueci minha senha.
- Alterar senha.
- Middleware de sessão Supabase.
- Proteção de rotas por papel.
- 3 níveis de acesso: Super Admin, Coach e Aluno.
- Dashboard inteligente do Coach.
- Dashboard do Super Admin.
- Área do Aluno somente leitura.
- Cadastro/listagem de Coaches.
- Cadastro/listagem de Alunos.
- Treinos por aluno, separados por dia da semana.
- Biblioteca central de exercícios com foto, vídeo externo, descrição, passos, dicas, erros comuns, equipamento e dificuldade.
- Prescrição de treino separada do exercício da biblioteca.
- Módulo de treinos conectado ao Supabase em produção, buscando biblioteca, alunos, treinos, prescrições e histórico real via RLS.
- Cadastro/edição de exercícios próprios do Coach pela interface, sem `service_role` no navegador.
- Montagem de treino real vinculada ao aluno correto, com prescrições salvas em `workouts` e `workout_exercises`.
- Área do aluno mobile-first com cards visuais de exercícios, detalhe técnico, histórico do último treino, feedback rápido e cronômetro de descanso.
- Registro real de série concluída e feedback em `workout_exercise_logs` e `workout_feedbacks`.
- Estrutura de logs reais de execução por série para evolução de carga, volume e frequência.
- Dietas com refeições.
- Avaliações com IMC automático no banco.
- Protocolo hormonal opcional e separado.
- Recados.
- Alertas inteligentes.
- Migration Supabase com tabelas, índices, relacionamentos e RLS.
- Seeds de demonstração.
- Projeto pronto para Vercel.

## Preparado para futuras versões

- Push Notifications.
- Chat Coach ↔ Aluno.
- Financeiro.
- Assinaturas.
- IA para geração de treinos.
- IA para sugestão de dieta.
- App Android.
- App iPhone.
- Server Actions para gravação real.
- Rotas server-side para criação automática de aluno via Supabase Auth Admin.

## Como rodar localmente

Requisitos:

- Node.js 20 ou superior.

Comandos:

```bash
npm install
npm run dev
```

Acesse:

```bash
http://localhost:3000
```

## Variáveis de ambiente

Crie `.env.local` baseado em `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_ROLE=coach
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-somente-no-servidor
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave pública anon do Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: usar somente em rotas server-side seguras. Nunca usar em componentes client.
- Para testar sem Supabase, mantenha `NEXT_PUBLIC_DEMO_MODE=true`.
- Em produção, use `NEXT_PUBLIC_DEMO_MODE=false`. Com Supabase configurado, o módulo de treinos usa dados reais e não depende dos dados demo.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Supabase

Execute no SQL Editor:

```sql
supabase/migrations/20260706212000_initial_saas_schema.sql
```

Para evoluir o módulo de treinos com biblioteca central de exercícios, prescrições e histórico de execução, execute também:

```sql
supabase/migrations/20260827090000_exercise_library_and_workout_execution.sql
```

Depois:

1. Crie usuários em Supabase Auth para Super Admin, Coach e Aluno.
2. Substitua os UUIDs em `supabase/seed.sql` pelos IDs reais dos usuários.
3. Execute:

```sql
supabase/seed.sql
```

Documentação adicional:

```text
supabase/docs/README_SQL.md
```

## Deploy na Vercel

1. Envie o projeto para o GitHub.
2. Na Vercel, clique em `Add New Project`.
3. Selecione o repositório.
4. Framework: `Next.js`.
5. Build Command: `npm run build`.
6. Configure as variáveis em `Project Settings > Environment Variables`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DEMO_MODE=false`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Faça o deploy.

## Segurança

- Coach acessa somente dados com `coach_id = auth.uid()`.
- Aluno acessa somente dados vinculados a `students.auth_user_id = auth.uid()`.
- Super Admin gerencia Coaches e estatísticas agregadas via `platform_metrics()`, sem leitura direta de dados operacionais detalhados.
- RLS está habilitado em todas as tabelas operacionais.
- A biblioteca de exercícios permite itens globais da plataforma e itens próprios do Coach, mantendo isolamento por RLS.
- Logs e feedbacks de treino só podem ser lidos pelo Coach responsável ou pelo próprio Aluno.
- Chaves sensíveis não ficam no código.
