-- Seeds de demonstração.
-- Crie primeiro os usuários no Supabase Auth e substitua os UUIDs abaixo pelos IDs reais.

insert into public.profiles (id, role, full_name, email, phone, cpf, status, plan, notes)
values
  ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Nicolas Reis', 'admin@coachflow.com', '(11) 90000-0000', '000.000.000-00', 'active', 'platform', 'Proprietário do sistema.'),
  ('00000000-0000-0000-0000-000000000002', 'coach', 'Mariana Costa', 'coach@coachflow.com', '(11) 98888-1111', '123.456.789-00', 'active', 'Pro', 'Especialista em hipertrofia.')
on conflict (id) do nothing;

insert into public.profiles (id, role, full_name, email, phone, status, coach_id)
values
  ('00000000-0000-0000-0000-000000000003', 'student', 'Lucas Andrade', 'aluno@coachflow.com', '(11) 98888-1212', 'active', '00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.students (id, coach_id, auth_user_id, name, phone, email, birth_date, sex, weight, height, goal, level, status, joined_at, diet_frequency_days, workout_frequency_days, protocol_frequency_days)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Lucas Andrade', '(11) 98888-1212', 'aluno@coachflow.com', '1996-04-18', 'masculino', 82, 1.78, 'Hipertrofia', 'intermediario', 'active', '2026-07-02', 30, 28, 14)
on conflict (id) do nothing;
