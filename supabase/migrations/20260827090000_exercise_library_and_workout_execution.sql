create extension if not exists "pgcrypto";

do $$
begin
  create type public.exercise_difficulty as enum ('iniciante', 'intermediario', 'avancado');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.exercise_media_type as enum ('image', 'video_url', 'video_storage');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.exercise_feedback_level as enum ('facil', 'ideal', 'dificil');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.set_completion_status as enum ('pending', 'completed', 'skipped');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  muscle_group text not null,
  muscle_subgroup text,
  category text,
  equipment text,
  difficulty public.exercise_difficulty not null default 'iniciante',
  cover_url text,
  video_url text,
  description text,
  execution_steps text[] not null default '{}'::text[],
  execution_tips text[] not null default '{}'::text[],
  common_mistakes text[] not null default '{}'::text[],
  notes text,
  status public.record_status not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.exercise_library is
  'Biblioteca central de exercícios. Registros com coach_id nulo podem ser usados como biblioteca global da plataforma; registros com coach_id pertencem ao coach.';
comment on column public.exercise_library.video_url is
  'URL externa demonstrativa. Para vídeo próprio, usar exercise_media com media_type = video_storage e storage_path.';

create table if not exists public.exercise_media (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercise_library(id) on delete cascade,
  media_type public.exercise_media_type not null,
  url text,
  storage_path text,
  title text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint exercise_media_has_source check (
    url is not null or storage_path is not null
  )
);

create table if not exists public.exercise_alternatives (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercise_library(id) on delete cascade,
  alternative_exercise_id uuid not null references public.exercise_library(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  constraint exercise_alternatives_not_self check (exercise_id <> alternative_exercise_id),
  constraint exercise_alternatives_unique unique (exercise_id, alternative_exercise_id)
);

alter table public.workouts
  add column if not exists goal text,
  add column if not exists source_template_id uuid,
  add column if not exists copied_from_workout_id uuid references public.workouts(id) on delete set null,
  add column if not exists is_template boolean not null default false;

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  goal text,
  notes text,
  created_from_workout_id uuid references public.workouts(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workouts_source_template_fk'
      and conrelid = 'public.workouts'::regclass
  ) then
    alter table public.workouts
      add constraint workouts_source_template_fk
      foreign key (source_template_id)
      references public.workout_templates(id)
      on delete set null;
  end if;
end $$;

alter table public.workout_exercises
  add column if not exists exercise_id uuid references public.exercise_library(id) on delete set null,
  add column if not exists prescription_title text,
  add column if not exists target_time text,
  add column if not exists target_distance text,
  add column if not exists rpe text,
  add column if not exists rir text,
  add column if not exists method text,
  add column if not exists coach_notes text,
  add column if not exists alternative_exercise_id uuid references public.exercise_library(id) on delete set null,
  add column if not exists status public.set_completion_status not null default 'pending',
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id uuid references public.exercise_library(id) on delete set null,
  weekday public.weekday_type not null,
  prescription_title text,
  sets text,
  repetitions text,
  load text,
  rest text,
  target_time text,
  target_distance text,
  rpe text,
  rir text,
  method text,
  coach_notes text,
  alternative_exercise_id uuid references public.exercise_library(id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_exercise_logs (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  performed_at timestamptz not null default now(),
  set_number integer,
  status public.set_completion_status not null default 'completed',
  load_used text,
  repetitions_done text,
  effort_perception integer check (effort_perception between 1 and 10),
  difficulty public.exercise_feedback_level,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_feedbacks (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  feedback public.exercise_feedback_level not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists exercise_library_coach_status_idx
  on public.exercise_library(coach_id, status);
create index if not exists exercise_library_search_idx
  on public.exercise_library using gin (
    to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(muscle_group, '') || ' ' || coalesce(equipment, ''))
  );
create index if not exists exercise_media_exercise_idx
  on public.exercise_media(exercise_id, position);
create index if not exists exercise_alternatives_exercise_idx
  on public.exercise_alternatives(exercise_id);
create index if not exists workout_templates_coach_idx
  on public.workout_templates(coach_id, created_at desc);
create index if not exists workout_template_exercises_template_idx
  on public.workout_template_exercises(template_id, weekday, position);
create index if not exists workout_exercises_exercise_idx
  on public.workout_exercises(exercise_id);
create index if not exists workout_exercise_logs_student_exercise_idx
  on public.workout_exercise_logs(student_id, workout_exercise_id, performed_at desc);
create index if not exists workout_exercise_logs_coach_idx
  on public.workout_exercise_logs(coach_id, performed_at desc);
create index if not exists workout_feedbacks_coach_idx
  on public.workout_feedbacks(coach_id, created_at desc);

alter table public.exercise_library enable row level security;
alter table public.exercise_media enable row level security;
alter table public.exercise_alternatives enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.workout_exercise_logs enable row level security;
alter table public.workout_feedbacks enable row level security;

drop policy if exists "exercise_library_select_scoped" on public.exercise_library;
drop policy if exists "exercise_library_coach_write" on public.exercise_library;
drop policy if exists "exercise_media_select_scoped" on public.exercise_media;
drop policy if exists "exercise_media_coach_write" on public.exercise_media;
drop policy if exists "exercise_alternatives_select_scoped" on public.exercise_alternatives;
drop policy if exists "exercise_alternatives_coach_write" on public.exercise_alternatives;
drop policy if exists "workout_templates_select_coach" on public.workout_templates;
drop policy if exists "workout_templates_coach_write" on public.workout_templates;
drop policy if exists "workout_template_exercises_select_coach" on public.workout_template_exercises;
drop policy if exists "workout_template_exercises_coach_write" on public.workout_template_exercises;
drop policy if exists "workout_exercise_logs_select_scoped" on public.workout_exercise_logs;
drop policy if exists "workout_exercise_logs_student_insert" on public.workout_exercise_logs;
drop policy if exists "workout_exercise_logs_coach_read_update" on public.workout_exercise_logs;
drop policy if exists "workout_feedbacks_select_scoped" on public.workout_feedbacks;
drop policy if exists "workout_feedbacks_student_insert" on public.workout_feedbacks;
drop policy if exists "workout_feedbacks_coach_update" on public.workout_feedbacks;

create policy "exercise_library_select_scoped"
on public.exercise_library for select
using (
  public.is_super_admin()
  or coach_id = auth.uid()
  or (
    status = 'active'
    and (
      coach_id is null
      or exists (
        select 1
        from public.workouts w
        join public.workout_exercises we on we.workout_id = w.id
        where we.exercise_id = exercise_library.id
          and public.is_own_student(w.student_id)
      )
    )
  )
);

create policy "exercise_library_coach_write"
on public.exercise_library for all
using (coach_id = auth.uid() or public.is_super_admin())
with check (
  public.is_super_admin()
  or (coach_id = auth.uid() and public.is_active_coach(coach_id))
);

create policy "exercise_media_select_scoped"
on public.exercise_media for select
using (
  exists (
    select 1 from public.exercise_library e
    where e.id = exercise_id
      and (
        public.is_super_admin()
        or e.coach_id = auth.uid()
        or (
          e.status = 'active'
          and (
            e.coach_id is null
            or exists (
              select 1
              from public.workouts w
              join public.workout_exercises we on we.workout_id = w.id
              where we.exercise_id = e.id
                and public.is_own_student(w.student_id)
            )
          )
        )
      )
  )
);

create policy "exercise_media_coach_write"
on public.exercise_media for all
using (
  exists (
    select 1 from public.exercise_library e
    where e.id = exercise_id
      and (e.coach_id = auth.uid() or public.is_super_admin())
  )
)
with check (
  exists (
    select 1 from public.exercise_library e
    where e.id = exercise_id
      and (e.coach_id = auth.uid() or public.is_super_admin())
  )
);

create policy "exercise_alternatives_select_scoped"
on public.exercise_alternatives for select
using (
  exists (
    select 1 from public.exercise_library e
    where e.id = exercise_id
      and (
        public.is_super_admin()
        or e.coach_id = auth.uid()
        or (
          e.status = 'active'
          and (
            e.coach_id is null
            or exists (
              select 1
              from public.workouts w
              join public.workout_exercises we on we.workout_id = w.id
              where we.exercise_id = e.id
                and public.is_own_student(w.student_id)
            )
          )
        )
      )
  )
);

create policy "exercise_alternatives_coach_write"
on public.exercise_alternatives for all
using (
  exists (
    select 1 from public.exercise_library e
    where e.id = exercise_id
      and (e.coach_id = auth.uid() or public.is_super_admin())
  )
)
with check (
  exists (
    select 1 from public.exercise_library e
    where e.id = exercise_id
      and (e.coach_id = auth.uid() or public.is_super_admin())
  )
);

create policy "workout_templates_select_coach"
on public.workout_templates for select
using (coach_id = auth.uid() or public.is_super_admin());

create policy "workout_templates_coach_write"
on public.workout_templates for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy "workout_template_exercises_select_coach"
on public.workout_template_exercises for select
using (
  exists (
    select 1 from public.workout_templates t
    where t.id = template_id
      and (t.coach_id = auth.uid() or public.is_super_admin())
  )
);

create policy "workout_template_exercises_coach_write"
on public.workout_template_exercises for all
using (
  exists (
    select 1 from public.workout_templates t
    where t.id = template_id
      and t.coach_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workout_templates t
    where t.id = template_id
      and t.coach_id = auth.uid()
  )
);

create policy "workout_exercise_logs_select_scoped"
on public.workout_exercise_logs for select
using (
  coach_id = auth.uid()
  or public.is_own_student(student_id)
);

create policy "workout_exercise_logs_student_insert"
on public.workout_exercise_logs for insert
with check (
  public.is_own_student(student_id)
  and exists (
    select 1 from public.workouts w
    where w.id = workout_id
      and w.student_id = workout_exercise_logs.student_id
      and w.coach_id = workout_exercise_logs.coach_id
  )
);

create policy "workout_exercise_logs_coach_read_update"
on public.workout_exercise_logs for update
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy "workout_feedbacks_select_scoped"
on public.workout_feedbacks for select
using (
  coach_id = auth.uid()
  or public.is_own_student(student_id)
);

create policy "workout_feedbacks_student_insert"
on public.workout_feedbacks for insert
with check (
  public.is_own_student(student_id)
  and exists (
    select 1 from public.workouts w
    where w.id = workout_id
      and w.student_id = workout_feedbacks.student_id
      and w.coach_id = workout_feedbacks.coach_id
  )
);

create policy "workout_feedbacks_coach_update"
on public.workout_feedbacks for update
using (coach_id = auth.uid())
with check (coach_id = auth.uid());
