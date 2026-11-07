-- KV Medak BSG OYMS 4.0 — Supabase schema
-- Run this in the Supabase SQL Editor before enabling production accounts.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'member' check (role in ('super_admin','school_admin','unit_leader','patrol_leader','member')),
  member_id uuid,
  unit text,
  patrol_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('Scout','Guide','Rover','Ranger')),
  leader_name text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.patrols (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'Scout',
  leader_id uuid references public.profiles(id) on delete set null,
  assistant_leader text default '',
  capacity integer not null default 8 check (capacity between 1 and 8),
  created_at timestamptz not null default now(),
  unique(name, unit)
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  category text not null default 'Scout' check (category in ('Scout','Guide','Rover','Ranger')),
  parents_names text default '',
  dob date,
  address text default '',
  pin_code text default '',
  email text default '',
  mobile text default '',
  joining_date date,
  bsg_uid text unique,
  unit text default 'Scout',
  patrol_id uuid references public.patrols(id) on delete set null,
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  session_date date not null,
  start_time time,
  closing_time time,
  unit text default 'All',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  status text not null check (status in ('present','absent','late','excused')),
  marked_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(session_id, member_id)
);

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  stage text not null check (stage in ('Pravesh','Pratham Sopan','Dwitiya Sopan','Tritiya Sopan','Rajya Puraskar','Rashtrapati')),
  test_date date,
  max_marks numeric not null default 100,
  unit text default 'All',
  created_at timestamptz not null default now()
);

create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  marks numeric not null default 0,
  remarks text default '',
  entered_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(test_id, member_id)
);

create table if not exists public.progression_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  stage text not null,
  completion_date date,
  status text not null default 'in_progress' check (status in ('in_progress','completed','awarded')),
  certificate_number text default '',
  remarks text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text default 'Activity',
  event_date date,
  venue text default '',
  description text default '',
  status text default 'upcoming',
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text default '',
  published_on date default current_date,
  audience text default 'All',
  is_published boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  recipient_name text not null,
  certificate_type text not null,
  certificate_number text default '',
  issue_date date default current_date,
  remarks text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.logbook_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  entry_date date default current_date,
  activity text not null,
  learning text default '',
  verified_by text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  category text not null,
  parents_names text default '',
  dob date,
  mobile text default '',
  email text default '',
  address text default '',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected'))
);
alter table public.registration_requests add column if not exists created_at timestamptz not null default now();

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce(public.current_role() in ('super_admin','school_admin','unit_leader'), false) $$;

alter table public.profiles enable row level security;
alter table public.units enable row level security;
alter table public.patrols enable row level security;
alter table public.members enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.tests enable row level security;
alter table public.test_results enable row level security;
alter table public.progression_records enable row level security;
alter table public.events enable row level security;
alter table public.notices enable row level security;
alter table public.certificates enable row level security;
alter table public.logbook_entries enable row level security;
alter table public.registration_requests enable row level security;

create policy "profiles read own or staff" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_staff());
-- Role changes are deliberately not exposed to browser clients. Manage roles via the trusted Supabase SQL editor or a secured server-side admin function.

create policy "units readable by authenticated" on public.units for select to authenticated using (true);
create policy "units staff manage" on public.units for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "patrols readable by authenticated" on public.patrols for select to authenticated using (true);
create policy "patrols staff manage" on public.patrols for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "members staff read" on public.members for select to authenticated using (
  public.is_staff() or exists (select 1 from public.profiles p where p.id=auth.uid() and (p.member_id=members.id or p.patrol_id=members.patrol_id))
);
create policy "members staff insert" on public.members for insert to authenticated with check (public.is_staff());
create policy "members staff update" on public.members for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "members staff delete" on public.members for delete to authenticated using (public.current_role() in ('super_admin','school_admin'));

create policy "attendance sessions staff read" on public.attendance_sessions for select to authenticated using (public.is_staff() or public.current_role()='patrol_leader');
create policy "attendance sessions staff manage" on public.attendance_sessions for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "attendance records staff or assigned patrol read" on public.attendance_records for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.profiles p join public.members m on m.id=attendance_records.member_id
    where p.id=auth.uid() and p.role='patrol_leader' and p.patrol_id=m.patrol_id
  )
);
create policy "attendance records staff or assigned patrol manage" on public.attendance_records for all to authenticated using (
  public.is_staff() or exists (
    select 1 from public.profiles p join public.members m on m.id=attendance_records.member_id
    where p.id=auth.uid() and p.role='patrol_leader' and p.patrol_id=m.patrol_id
  )
) with check (
  public.is_staff() or exists (
    select 1 from public.profiles p join public.members m on m.id=attendance_records.member_id
    where p.id=auth.uid() and p.role='patrol_leader' and p.patrol_id=m.patrol_id
  )
);

create policy "tests staff read" on public.tests for select to authenticated using (true);
create policy "tests staff manage" on public.tests for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "results staff or assigned patrol manage" on public.test_results for all to authenticated using (
  public.is_staff() or exists (
    select 1 from public.profiles p join public.members m on m.id=test_results.member_id
    where p.id=auth.uid() and p.role='patrol_leader' and p.patrol_id=m.patrol_id
  )
) with check (
  public.is_staff() or exists (
    select 1 from public.profiles p join public.members m on m.id=test_results.member_id
    where p.id=auth.uid() and p.role='patrol_leader' and p.patrol_id=m.patrol_id
  )
);
create policy "progression staff manage" on public.progression_records for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "events authenticated read" on public.events for select to authenticated using (true);
create policy "events staff manage" on public.events for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "notices published read" on public.notices for select to authenticated using (is_published or public.is_staff());
create policy "notices staff manage" on public.notices for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "certificates staff manage" on public.certificates for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "logbook own or staff" on public.logbook_entries for all to authenticated using (
  public.is_staff() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.member_id=logbook_entries.member_id)
) with check (
  public.is_staff() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.member_id=logbook_entries.member_id)
);
create policy "public registration submit" on public.registration_requests for insert to anon, authenticated with check (status='pending');
create policy "staff review registration" on public.registration_requests for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- IMPORTANT: Create the first Super Admin profile manually after creating that user in
-- Supabase Authentication. Never expose the Supabase service-role key in the browser.
-- Example (replace UUID/email):
-- insert into public.profiles(id, full_name, email, role)
-- values ('AUTH-USER-UUID', 'Portal Administrator', 'admin@example.com', 'super_admin');
