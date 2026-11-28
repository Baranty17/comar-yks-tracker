-- ==========================================
-- COMAR YKS TRACKER - DATABASE V1
-- ==========================================

create extension if not exists pgcrypto;

-- STUDENT PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Öğrenci',
  role text not null default 'student'
    check (role in ('coach', 'student')),
  created_at timestamptz default now()
);

-- STUDY SESSIONS
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'Genel',
  topic text,
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  session_date date not null default current_date,
  created_at timestamptz default now()
);

-- TASKS
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text default 'Genel',
  due_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- EXAM RESULTS
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_type text not null check (exam_type in ('TYT','AYT')),
  exam_name text not null,
  exam_date date default current_date,
  turkish_correct numeric default 0,
  turkish_wrong numeric default 0,
  social_correct numeric default 0,
  social_wrong numeric default 0,
  math_correct numeric default 0,
  math_wrong numeric default 0,
  science_correct numeric default 0,
  science_wrong numeric default 0,
  created_at timestamptz default now()
);

-- SECURITY
alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.tasks enable row level security;
alter table public.exams enable row level security;

-- PROFILES POLICIES
drop policy if exists "profile_select_own" on public.profiles;
create policy "profile_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profile_insert_own" on public.profiles;
create policy "profile_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profile_update_own" on public.profiles;
create policy "profile_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- STUDY SESSION POLICIES
drop policy if exists "sessions_own" on public.study_sessions;
create policy "sessions_own"
on public.study_sessions for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- TASK POLICIES
drop policy if exists "tasks_own" on public.tasks;
create policy "tasks_own"
on public.tasks for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- EXAM POLICIES
drop policy if exists "exams_own" on public.exams;
create policy "exams_own"
on public.exams for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- INDEXES
create index if not exists sessions_user_date
on public.study_sessions(user_id, session_date desc);

create index if not exists tasks_user_date
on public.tasks(user_id, due_date);

create index if not exists exams_user_date
on public.exams(user_id, exam_date desc);
