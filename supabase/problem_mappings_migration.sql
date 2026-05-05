create table if not exists public.problem_mappings (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete cascade,
  mom_question_id text not null,
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
  unique(teacher_id, mom_question_id)
);

drop trigger if exists problem_mappings_set_updated_at on public.problem_mappings;
create trigger problem_mappings_set_updated_at before update on public.problem_mappings for each row execute function public.set_updated_at();

create index if not exists problem_mappings_teacher_id_idx on public.problem_mappings(teacher_id);
create index if not exists problem_mappings_mom_question_id_idx on public.problem_mappings(mom_question_id);

alter table public.problem_mappings enable row level security;

drop policy if exists "problem_mappings select own rows" on public.problem_mappings;
create policy "problem_mappings select own rows" on public.problem_mappings for select using (teacher_id = auth.uid());
drop policy if exists "problem_mappings insert own rows" on public.problem_mappings;
create policy "problem_mappings insert own rows" on public.problem_mappings for insert with check (teacher_id = auth.uid());
drop policy if exists "problem_mappings update own rows" on public.problem_mappings;
create policy "problem_mappings update own rows" on public.problem_mappings for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists "problem_mappings delete own rows" on public.problem_mappings;
create policy "problem_mappings delete own rows" on public.problem_mappings for delete using (teacher_id = auth.uid());
