create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  school_name text,
  school_year text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  class_name text not null,
  period_label text,
  term text,
  school_year text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  local_student_id text,
  display_name text not null,
  first_name text,
  last_name text,
  email text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  assignment_name text not null,
  source text default 'MyOpenMath',
  assignment_type text,
  date_administered date,
  total_points numeric,
  raw_file_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete cascade,
  mom_question_label text not null,
  mom_question_id text,
  points_possible numeric default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.question_tags (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  raw_tag text,
  teks_code text,
  skill_description text,
  standard_type text,
  priority text,
  complexity text,
  reporting_category_id integer,
  reporting_category_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(question_id)
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  assignment_id uuid references public.assignments(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  teks_code text,
  score numeric,
  points_possible numeric,
  percent numeric,
  date_administered date,
  created_at timestamptz default now()
);

create table if not exists public.prior_staar_data (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  prior_year text,
  prior_test text,
  prior_scale_score integer,
  prior_performance_level text,
  prior_progress_measure text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at before update on public.classes for each row execute function public.set_updated_at();

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at before update on public.students for each row execute function public.set_updated_at();

drop trigger if exists assignments_set_updated_at on public.assignments;
create trigger assignments_set_updated_at before update on public.assignments for each row execute function public.set_updated_at();

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at before update on public.questions for each row execute function public.set_updated_at();

drop trigger if exists question_tags_set_updated_at on public.question_tags;
create trigger question_tags_set_updated_at before update on public.question_tags for each row execute function public.set_updated_at();

drop trigger if exists prior_staar_data_set_updated_at on public.prior_staar_data;
create trigger prior_staar_data_set_updated_at before update on public.prior_staar_data for each row execute function public.set_updated_at();

create index if not exists classes_teacher_id_idx on public.classes(teacher_id);
create index if not exists students_teacher_id_idx on public.students(teacher_id);
create index if not exists students_class_id_idx on public.students(class_id);
create index if not exists students_teacher_local_student_id_idx on public.students(teacher_id, local_student_id);
create index if not exists assignments_teacher_id_idx on public.assignments(teacher_id);
create index if not exists questions_assignment_id_idx on public.questions(assignment_id);
create index if not exists question_tags_question_id_idx on public.question_tags(question_id);
create index if not exists evidence_teacher_id_idx on public.evidence(teacher_id);
create index if not exists evidence_student_id_idx on public.evidence(student_id);
create index if not exists evidence_class_id_idx on public.evidence(class_id);
create index if not exists evidence_assignment_id_idx on public.evidence(assignment_id);
create index if not exists evidence_question_id_idx on public.evidence(question_id);
create index if not exists evidence_teks_code_idx on public.evidence(teks_code);
create index if not exists evidence_student_teks_code_idx on public.evidence(student_id, teks_code);
create index if not exists prior_staar_data_student_id_idx on public.prior_staar_data(student_id);

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.questions enable row level security;
alter table public.question_tags enable row level security;
alter table public.evidence enable row level security;
alter table public.prior_staar_data enable row level security;

drop policy if exists "profiles select own profile" on public.profiles;
create policy "profiles select own profile" on public.profiles for select using (id = auth.uid());

drop policy if exists "profiles insert own profile" on public.profiles;
create policy "profiles insert own profile" on public.profiles for insert with check (id = auth.uid());

drop policy if exists "profiles update own profile" on public.profiles;
create policy "profiles update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "classes select own rows" on public.classes;
create policy "classes select own rows" on public.classes for select using (teacher_id = auth.uid());
drop policy if exists "classes insert own rows" on public.classes;
create policy "classes insert own rows" on public.classes for insert with check (teacher_id = auth.uid());
drop policy if exists "classes update own rows" on public.classes;
create policy "classes update own rows" on public.classes for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "classes delete own rows" on public.classes;
create policy "classes delete own rows" on public.classes for delete using (teacher_id = auth.uid());

drop policy if exists "students select own rows" on public.students;
create policy "students select own rows" on public.students for select using (teacher_id = auth.uid());
drop policy if exists "students insert own rows" on public.students;
create policy "students insert own rows" on public.students for insert with check (teacher_id = auth.uid());
drop policy if exists "students update own rows" on public.students;
create policy "students update own rows" on public.students for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "students delete own rows" on public.students;
create policy "students delete own rows" on public.students for delete using (teacher_id = auth.uid());

drop policy if exists "assignments select own rows" on public.assignments;
create policy "assignments select own rows" on public.assignments for select using (teacher_id = auth.uid());
drop policy if exists "assignments insert own rows" on public.assignments;
create policy "assignments insert own rows" on public.assignments for insert with check (teacher_id = auth.uid());
drop policy if exists "assignments update own rows" on public.assignments;
create policy "assignments update own rows" on public.assignments for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "assignments delete own rows" on public.assignments;
create policy "assignments delete own rows" on public.assignments for delete using (teacher_id = auth.uid());

drop policy if exists "questions select own rows" on public.questions;
create policy "questions select own rows" on public.questions for select using (teacher_id = auth.uid());
drop policy if exists "questions insert own rows" on public.questions;
create policy "questions insert own rows" on public.questions for insert with check (teacher_id = auth.uid());
drop policy if exists "questions update own rows" on public.questions;
create policy "questions update own rows" on public.questions for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "questions delete own rows" on public.questions;
create policy "questions delete own rows" on public.questions for delete using (teacher_id = auth.uid());

drop policy if exists "question_tags select own rows" on public.question_tags;
create policy "question_tags select own rows" on public.question_tags for select using (teacher_id = auth.uid());
drop policy if exists "question_tags insert own rows" on public.question_tags;
create policy "question_tags insert own rows" on public.question_tags for insert with check (teacher_id = auth.uid());
drop policy if exists "question_tags update own rows" on public.question_tags;
create policy "question_tags update own rows" on public.question_tags for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "question_tags delete own rows" on public.question_tags;
create policy "question_tags delete own rows" on public.question_tags for delete using (teacher_id = auth.uid());

drop policy if exists "evidence select own rows" on public.evidence;
create policy "evidence select own rows" on public.evidence for select using (teacher_id = auth.uid());
drop policy if exists "evidence insert own rows" on public.evidence;
create policy "evidence insert own rows" on public.evidence for insert with check (teacher_id = auth.uid());
drop policy if exists "evidence update own rows" on public.evidence;
create policy "evidence update own rows" on public.evidence for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "evidence delete own rows" on public.evidence;
create policy "evidence delete own rows" on public.evidence for delete using (teacher_id = auth.uid());

drop policy if exists "prior_staar_data select own rows" on public.prior_staar_data;
create policy "prior_staar_data select own rows" on public.prior_staar_data for select using (teacher_id = auth.uid());
drop policy if exists "prior_staar_data insert own rows" on public.prior_staar_data;
create policy "prior_staar_data insert own rows" on public.prior_staar_data for insert with check (teacher_id = auth.uid());
drop policy if exists "prior_staar_data update own rows" on public.prior_staar_data;
create policy "prior_staar_data update own rows" on public.prior_staar_data for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "prior_staar_data delete own rows" on public.prior_staar_data;
create policy "prior_staar_data delete own rows" on public.prior_staar_data for delete using (teacher_id = auth.uid());
