create extension if not exists "pgcrypto";

create table if not exists public.teachers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  school_year text not null default '2026-2027',
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  name text not null,
  period_label text not null,
  term text,
  school_year text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  local_student_id text,
  display_name text not null,
  first_name text,
  last_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  name text not null,
  source text not null default 'MyOpenMath',
  assignment_type text not null check (assignment_type in ('Diagnostic', 'Practice', 'Quiz', 'Test', 'Review', 'Other')),
  date_administered date not null,
  total_points numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  mom_question_label text not null,
  mom_question_id text,
  points_possible numeric not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.question_tags (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  raw_tag text,
  teks_code text,
  skill_description text,
  standard_type text,
  priority text,
  complexity text,
  reporting_category_id text,
  reporting_category_name text,
  created_at timestamptz not null default now(),
  unique(question_id)
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  teks_code text,
  score numeric not null default 0,
  points_possible numeric not null default 1,
  percent numeric not null default 0,
  date_administered date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.prior_staar_data (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  prior_year text,
  prior_test text,
  prior_scale_score text,
  prior_performance_level text,
  prior_progress_measure text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists classes_teacher_id_idx on public.classes(teacher_id);
create index if not exists students_teacher_id_idx on public.students(teacher_id);
create index if not exists assignments_teacher_id_idx on public.assignments(teacher_id);
create index if not exists questions_teacher_assignment_idx on public.questions(teacher_id, assignment_id);
create index if not exists question_tags_teacher_question_idx on public.question_tags(teacher_id, question_id);
create index if not exists evidence_teacher_student_teks_idx on public.evidence(teacher_id, student_id, teks_code);
create index if not exists evidence_teacher_class_teks_idx on public.evidence(teacher_id, class_id, teks_code);

alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.questions enable row level security;
alter table public.question_tags enable row level security;
alter table public.evidence enable row level security;
alter table public.prior_staar_data enable row level security;

create policy "teachers own profile" on public.teachers for all using (id = auth.uid()) with check (id = auth.uid());
create policy "teachers own classes" on public.classes for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teachers own students" on public.students for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teachers own assignments" on public.assignments for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teachers own questions" on public.questions for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teachers own question tags" on public.question_tags for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teachers own evidence" on public.evidence for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teachers own prior staar" on public.prior_staar_data for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
