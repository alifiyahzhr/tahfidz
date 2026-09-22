-- Named teachers per kelompok, so the teacher sign-in flow can offer a
-- dropdown instead of free text (while still allowing a new name to be
-- added on the spot).
create table teachers (
  id uuid primary key default gen_random_uuid(),
  kelompok_id uuid not null references kelompok(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  unique (kelompok_id, full_name)
);

create index on teachers (kelompok_id);

alter table teachers enable row level security;

-- Per-student target per term, replacing the old per-class target -- every
-- child progresses at their own pace even within the same class.
create table student_targets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  target_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, term_id)
);

create index on student_targets (term_id);

alter table student_targets enable row level security;
