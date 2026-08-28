# CoachFlow SQL

Execute em ordem:

1. `supabase/migrations/20260706212000_initial_saas_schema.sql`
2. Crie usuários em Supabase Auth para Super Admin, Coach e Aluno.
3. Ajuste os UUIDs do `supabase/seed.sql`.
4. Execute `supabase/seed.sql`.

## Regras de segurança

- Super Admin visualiza perfis de Coaches e estatísticas agregadas pela função `platform_metrics()`.
- Super Admin não possui políticas de leitura direta para dados operacionais detalhados de todos os alunos.
- Coach acessa somente registros com `coach_id = auth.uid()`.
- Aluno acessa somente registros cujo `student.auth_user_id = auth.uid()`.
- Escritas de treino, dieta, avaliação, protocolo, recado e alerta validam se o aluno pertence ao Coach autenticado.

## Criação automática de aluno

Para produção, crie uma rota server-side ou Edge Function usando `SUPABASE_SERVICE_ROLE_KEY` somente no backend:

1. Criar usuário em `auth.admin.createUser`.
2. Inserir `profiles` com `role = 'student'` e `coach_id`.
3. Inserir `students` com `auth_user_id`.
4. Enviar senha inicial ou link de recuperação.

Nunca exponha a service role no navegador.
