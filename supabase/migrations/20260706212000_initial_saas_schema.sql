create extension if not exists "pgcrypto";

create type public.user_role as enum ('super_admin', 'coach', 'student');
create type public.record_status as enum ('active', 'inactive', 'blocked');
create type public.student_level as enum ('iniciante', 'intermediario', 'avancado');
create type public.sex_type as enum ('feminino', 'masculino', 'outro');
create type public.weekday_type as enum ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo');
create type public.alert_type as enum ('diet', 'workout', 'assessment', 'protocol');
create type public.alert_status as enum ('pending', 'done', 'snoozed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  email text not null unique,
  phone text,
  cpf text,
  status public.record_status not null default 'active',
  plan text,
  coach_id uuid references public.profiles(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_student_has_coach check (
    role <> 'student' or coach_id is not null
  )
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  auth_user_id uuid unique references public.profiles(id) on delete set null,
  name text not null,
  phone text,
  email text not null,
  birth_date date,
  sex public.sex_type,
  weight numeric(6,2),
  height numeric(4,2),
  goal text,
  level public.student_level not null default 'iniciante',
  status public.record_status not null default 'active',
  notes text,
  joined_at date not null default current_date,
  photo_url text,
  diet_frequency_days integer not null default 30,
  workout_frequency_days integer not null default 30,
  protocol_frequency_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  starts_at date not null default current_date,
  expires_at date,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  weekday public.weekday_type not null,
  name text not null,
  muscle_group text,
  sets text,
  repetitions text,
  load text,
  rest text,
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.diets (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  starts_at date not null default current_date,
  expires_at date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.diet_meals (
  id uuid primary key default gen_random_uuid(),
  diet_id uuid not null references public.diets(id) on delete cascade,
  name text not null,
  time time,
  foods text not null,
  amount text,
  substitutions text,
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  assessed_at date not null default current_date,
  weight numeric(6,2),
  height numeric(4,2),
  bmi numeric(5,2) generated always as (
    case when weight is not null and height is not null and height > 0
    then round(weight / (height * height), 2)
    else null end
  ) stored,
  body_fat numeric(5,2),
  lean_mass numeric(6,2),
  circumferences jsonb not null default '{}'::jsonb,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.assessment_photos (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table public.hormonal_protocols (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  medicine text not null,
  dosage text,
  days text,
  time time,
  starts_at date,
  ends_at date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  body text not null,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null
);

create table public.smart_alerts (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  type public.alert_type not null,
  due_at date not null,
  status public.alert_status not null default 'pending',
  completed_at timestamptz,
  snoozed_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_coach_id_idx on public.profiles(coach_id);
create index students_coach_id_idx on public.students(coach_id);
create index students_auth_user_id_idx on public.students(auth_user_id);
create index workouts_coach_student_idx on public.workouts(coach_id, student_id);
create index workout_exercises_workout_day_idx on public.workout_exercises(workout_id, weekday, position);
create index diets_coach_student_idx on public.diets(coach_id, student_id);
create index assessments_coach_student_idx on public.assessments(coach_id, student_id);
create index hormonal_protocols_coach_student_idx on public.hormonal_protocols(coach_id, student_id);
create index messages_coach_student_idx on public.messages(coach_id, student_id);
create index smart_alerts_coach_due_idx on public.smart_alerts(coach_id, due_at, status);

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
      and status = 'active'
  )
$$;

create or replace function public.is_active_coach(target_coach_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and id = target_coach_id
      and role = 'coach'
      and status = 'active'
  )
$$;

create or replace function public.is_own_student(target_student_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and s.auth_user_id = auth.uid()
  )
$$;

create or replace function public.student_belongs_to_current_coach(target_student_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and s.coach_id = auth.uid()
  )
$$;

create or replace function public.platform_metrics()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select case
    when public.is_super_admin() then jsonb_build_object(
      'coaches', (select count(*) from public.profiles where role = 'coach'),
      'active_coaches', (select count(*) from public.profiles where role = 'coach' and status = 'active'),
      'students', (select count(*) from public.students),
      'workouts', (select count(*) from public.workouts),
      'diets', (select count(*) from public.diets),
      'assessments', (select count(*) from public.assessments),
      'protocols', (select count(*) from public.hormonal_protocols)
    )
    else '{}'::jsonb
  end
$$;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.diets enable row level security;
alter table public.diet_meals enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_photos enable row level security;
alter table public.hormonal_protocols enable row level security;
alter table public.messages enable row level security;
alter table public.smart_alerts enable row level security;

create policy "profiles_select_scoped"
on public.profiles for select
using (
  public.is_super_admin()
  or id = auth.uid()
  or coach_id = auth.uid()
);

create policy "profiles_super_admin_write"
on public.profiles for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "students_select_scoped"
on public.students for select
using (
  coach_id = auth.uid()
  or auth_user_id = auth.uid()
);

create policy "students_coach_write"
on public.students for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy "workouts_select_scoped"
on public.workouts for select
using (
  coach_id = auth.uid()
  or public.is_own_student(student_id)
);

create policy "workouts_coach_write"
on public.workouts for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid() and public.student_belongs_to_current_coach(student_id));

create policy "workout_exercises_select_scoped"
on public.workout_exercises for select
using (
  exists (
    select 1 from public.workouts w
    where w.id = workout_id
      and (w.coach_id = auth.uid() or public.is_own_student(w.student_id))
  )
);

create policy "workout_exercises_coach_write"
on public.workout_exercises for all
using (exists (select 1 from public.workouts w where w.id = workout_id and w.coach_id = auth.uid()))
with check (exists (select 1 from public.workouts w where w.id = workout_id and w.coach_id = auth.uid()));

create policy "diets_select_scoped"
on public.diets for select
using (coach_id = auth.uid() or public.is_own_student(student_id));

create policy "diets_coach_write"
on public.diets for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid() and public.student_belongs_to_current_coach(student_id));

create policy "diet_meals_select_scoped"
on public.diet_meals for select
using (exists (select 1 from public.diets d where d.id = diet_id and (d.coach_id = auth.uid() or public.is_own_student(d.student_id))));

create policy "diet_meals_coach_write"
on public.diet_meals for all
using (exists (select 1 from public.diets d where d.id = diet_id and d.coach_id = auth.uid()))
with check (exists (select 1 from public.diets d where d.id = diet_id and d.coach_id = auth.uid()));

create policy "assessments_select_scoped"
on public.assessments for select
using (coach_id = auth.uid() or public.is_own_student(student_id));

create policy "assessments_coach_write"
on public.assessments for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid() and public.student_belongs_to_current_coach(student_id));

create policy "assessment_photos_select_scoped"
on public.assessment_photos for select
using (exists (select 1 from public.assessments a where a.id = assessment_id and (a.coach_id = auth.uid() or public.is_own_student(a.student_id))));

create policy "assessment_photos_coach_write"
on public.assessment_photos for all
using (exists (select 1 from public.assessments a where a.id = assessment_id and a.coach_id = auth.uid()))
with check (exists (select 1 from public.assessments a where a.id = assessment_id and a.coach_id = auth.uid()));

create policy "hormonal_protocols_select_scoped"
on public.hormonal_protocols for select
using (coach_id = auth.uid() or public.is_own_student(student_id));

create policy "hormonal_protocols_coach_write"
on public.hormonal_protocols for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid() and public.student_belongs_to_current_coach(student_id));

create policy "messages_select_scoped"
on public.messages for select
using (coach_id = auth.uid() or public.is_own_student(student_id));

create policy "messages_coach_insert"
on public.messages for insert
with check (coach_id = auth.uid() and public.student_belongs_to_current_coach(student_id));

create policy "messages_coach_delete"
on public.messages for delete
using (coach_id = auth.uid());

create policy "messages_student_mark_read"
on public.messages for update
using (public.is_own_student(student_id) or coach_id = auth.uid())
with check (public.is_own_student(student_id) or coach_id = auth.uid());

create policy "smart_alerts_select_coach"
on public.smart_alerts for select
using (coach_id = auth.uid());

create policy "smart_alerts_coach_write"
on public.smart_alerts for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid() and public.student_belongs_to_current_coach(student_id));
