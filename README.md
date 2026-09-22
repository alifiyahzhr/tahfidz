# Tahfidz Tracker

Progress and attendance tracking for the tahfidz program, starting with the
Sydney kelompok and built to expand to other kelompok across AU-NZ.

- **Teachers** sign in with a shared kelompok PIN, pick their class, and log
  attendance + reading progress + a proficiency rating + comments for each
  child, per session.
- **Admins** correct or fill in missing data, manage students/classes/terms,
  set a target per student per term, and view attendance & progress charts.
  Each student has their own profile with full history.

Data is divided by term (4 terms per school year, matching NSW school terms).

## Tech stack

Next.js (App Router, TypeScript) + Supabase (Postgres + Auth) + Recharts,
deployed on Vercel.

## One-time setup

You'll need two free accounts: **Supabase** (the database) and **Vercel**
(hosting). Both sign up with just an email, no card required.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, run each file in
   [`supabase/migrations/`](supabase/migrations/) in order (0001, 0002,
   0003...). This creates all the tables -- re-run any new ones as they're
   added later.
3. In **Project Settings → API**, copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this one secret)
4. In **Authentication → URL Configuration**, add your app's reset-password
   page to **Redirect URLs** (needed for the "change password" flow under
   Admin → Settings): `http://localhost:3000/admin/reset-password` for local
   dev, and `https://your-deployed-domain/admin/reset-password` once
   deployed.

### 2. Configure the app locally

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill in the three Supabase
values from above, plus a random string for `TEACHER_SESSION_SECRET`
(any long random text works).

### 3. Seed starter data

Open `scripts/seed.ts` and edit the `CONFIG` block at the top: the teacher
PIN you want, and the admin email/password you'll log in with. Then run:

```bash
npm run seed
```

This creates the AU-NZ daerah, the Sydney kelompok, the four NSW 2026 terms
(term 3 set active, since that's the term in progress), and your admin
login. It's safe to re-run.

### 4. Run it locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in as admin first
(`/admin`) to add classes and students, then try the teacher flow (`/teacher`)
with the PIN you set.

### 5. Deploy

Push this repo to GitHub, then in [Vercel](https://vercel.com) import the
repo and add the same four environment variables from `.env.local` in the
project's settings. Vercel will give you a real URL to share with teachers.

## Day-to-day admin tasks

- **Admin → Terms**: add each new term's dates and mark which one is active.
  Only the active term accepts new teacher sessions.
- **Admin → Classes**: add classes (recitation or memorisation).
- **Admin → Students**: add students (each must be assigned a class), set
  their target per term, edit details, view their full profile and history.
- **Admin → Sessions**: correct anything a teacher logged, or start one
  yourself for a student who was missed.
- **Admin → Reports**: attendance and progress charts per class, per term.
- **Admin → Settings**: view/change each kelompok's teacher PIN, change your
  own password (via an emailed confirmation link), and manage the
  pre-filled teacher name list.

## Scaling to more kelompok later

The schema already supports multiple daerah and kelompok. To add a new
kelompok: insert a row into `kelompok` (with its own PIN), add its classes
and students, and the same terms apply within its daerah. Each admin account
in `admin_users` can be scoped to a specific kelompok, a whole daerah, or
(for `super_admin`) everything.
