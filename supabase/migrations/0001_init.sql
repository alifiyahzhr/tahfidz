-- Tahfidz progress tracker schema
-- Hierarchy: daerah -> kelompok -> classes -> students
-- Data is scoped per term (4 terms per school year, matching NSW school terms).

create extension if not exists "pgcrypto";

create type class_type as enum ('memorisation', 'recitation');
create type attendance_status as enum ('hadir', 'izin_reason', 'izin_no_reason', 'absent');
create type proficiency_rating as enum ('ulang', 'cukup', 'baik', 'lancar');
create type admin_role as enum ('super_admin', 'daerah_admin', 'kelompok_admin');

create table daerah (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table kelompok (
  id uuid primary key default gen_random_uuid(),
  daerah_id uuid not null references daerah(id) on delete cascade,
  name text not null,
  slug text not null unique,
  pin_hash text not null,
  created_at timestamptz not null default now(),
  unique (daerah_id, name)
);

create table terms (
  id uuid primary key default gen_random_uuid(),
  daerah_id uuid not null references daerah(id) on delete cascade,
  year int not null,
  term_number smallint not null check (term_number between 1 and 4),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (daerah_id, year, term_number)
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  kelompok_id uuid not null references kelompok(id) on delete cascade,
  name text not null,
  type class_type not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kelompok_id, name)
);

create table students (
  id uuid primary key default gen_random_uuid(),
  kelompok_id uuid not null references kelompok(id) on delete cascade,
  full_name text not null,
  date_of_birth date,
  guardian_name text,
  guardian_contact text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Which class a student belongs to for a given term (tracks promotion between terms).
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, term_id)
);

-- Admin-set target for a class in a given term (e.g. "Complete Juz 29").
create table class_targets (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  target_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, term_id)
);

-- One row per class per date it was taught.
create table sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  session_date date not null,
  teacher_name text not null,
  created_at timestamptz not null default now(),
  unique (class_id, session_date)
);

-- One row per student per session: attendance + progress + rating + comments.
create table session_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  attendance attendance_status not null,
  progress_text text,
  proficiency proficiency_rating,
  comments text,
  updated_by_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, student_id)
);

-- Maps a Supabase Auth user to an admin role, scoped to a daerah and/or kelompok.
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role admin_role not null default 'kelompok_admin',
  daerah_id uuid references daerah(id) on delete set null,
  kelompok_id uuid references kelompok(id) on delete set null,
  created_at timestamptz not null default now()
);

create index on kelompok (daerah_id);
create index on terms (daerah_id);
create index on classes (kelompok_id);
create index on students (kelompok_id);
create index on enrollments (term_id);
create index on enrollments (class_id);
create index on class_targets (term_id);
create index on sessions (class_id);
create index on sessions (term_id);
create index on session_records (session_id);
create index on session_records (student_id);

-- Row Level Security: locked down by default. All application access goes
-- through server-side code using the service role key (which bypasses RLS),
-- because teachers authenticate with a shared kelompok PIN rather than
-- Supabase Auth. Admins get one narrow self-lookup policy so client code can
-- confirm "am I an admin" using their own authenticated session.
alter table daerah enable row level security;
alter table kelompok enable row level security;
alter table terms enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table enrollments enable row level security;
alter table class_targets enable row level security;
alter table sessions enable row level security;
alter table session_records enable row level security;
alter table admin_users enable row level security;

create policy "admins can read their own admin_users row"
  on admin_users for select
  using (auth_user_id = auth.uid());
