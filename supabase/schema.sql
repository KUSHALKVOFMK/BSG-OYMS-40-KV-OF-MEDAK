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


-- Added for the annual BSG member registration form (migration 202611150001).
alter table public.member_records add column if not exists urn_number text not null default '';


-- Current OYMS 4.0 live extensions (migrations 202611150001 and 202611150002).
alter table public.member_records add column if not exists urn_number text not null default '';
alter table public.profiles drop constraint if exists profiles_category_check;
alter table public.profiles add constraint profiles_category_check check (category is null or category in ('Scout','Guide','Cub','Bulbul'));
alter table public.member_records drop constraint if exists member_records_category_check;
alter table public.member_records add constraint member_records_category_check check (category in ('Scout','Guide','Cub','Bulbul'));
alter table public.member_records drop constraint if exists member_records_oms_status_check;
update public.member_records set oms_status='completed' where oms_status='updated';
alter table public.member_records add constraint member_records_oms_status_check check (oms_status in ('not_updated','in_progress','completed'));


-- OYMS 4.0 current role and workflow protections (migration 202611150003).
-- OYMS Sankalp 4.0: two active portal roles and database-enforced permissions.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'patrol_leader'));

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select coalesce(public.current_role() = 'super_admin', false)
$function$;

create or replace function public.guard_oyms_profile_role_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  if auth.uid() is not null
     and auth.uid() = old.id
     and old.role = 'patrol_leader' then
    if new.role is distinct from old.role
       or new.is_active is distinct from old.is_active
       or new.user_id is distinct from old.user_id
       or new.login_id is distinct from old.login_id
       or new.patrol_name is distinct from old.patrol_name
       or new.category is distinct from old.category then
      raise exception 'Patrol Leaders cannot change role, account status, login ID, assigned patrol, or section.';
    end if;
  end if;
  return new;
end;
$function$;

drop trigger if exists protect_oyms_profile_role_fields on public.profiles;
create trigger protect_oyms_profile_role_fields
before update on public.profiles
for each row execute function public.guard_oyms_profile_role_fields();

create or replace function public.guard_oyms_member_workflow_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  actor_role text;
  assigned_category text;
begin
  actor_role := public.current_role();

  if actor_role = 'patrol_leader' then
    if tg_op = 'INSERT' then
      new.patrol_leader_id := auth.uid();
      select category into assigned_category
      from public.profiles where id = auth.uid();
      new.category := assigned_category;
      new.bsg_uid := nullif(trim(coalesce(new.bsg_uid, '')), '');
      new.bsg_uid_known := new.bsg_uid is not null;
      new.submission_status := 'draft';
      new.review_status := 'pending';
      new.review_reason := '';
      new.otp_status := 'not_sent';
      new.oms_status := 'not_updated';
      new.final_status := 'pending';
      new.is_locked := false;
      new.member_login_id := null;
      new.is_active := true;
      new.is_departed := false;
      new.departure_reason := null;
      new.departed_at := null;
      new.departed_by := null;
    elsif tg_op = 'UPDATE' then
      if new.patrol_leader_id is distinct from old.patrol_leader_id
         or new.category is distinct from old.category
         or (new.review_status is distinct from old.review_status and new.review_status <> 'pending')
         or (new.review_reason is distinct from old.review_reason and new.review_reason <> '')
         or (new.otp_status is distinct from old.otp_status and new.otp_status <> 'not_sent')
         or new.oms_status is distinct from old.oms_status
         or new.final_status is distinct from old.final_status
         or new.is_locked is distinct from old.is_locked
         or new.member_login_id is distinct from old.member_login_id
         or new.is_active is distinct from old.is_active
         or new.is_departed is distinct from old.is_departed
         or new.departure_reason is distinct from old.departure_reason
         or new.departed_at is distinct from old.departed_at
         or new.departed_by is distinct from old.departed_by
         or new.created_at is distinct from old.created_at then
        raise exception 'Only the Super Admin can change member verification, OYMS status, approval, lock, ownership, or archive fields.';
      end if;
      new.bsg_uid := nullif(trim(coalesce(new.bsg_uid, '')), '');
      new.bsg_uid_known := new.bsg_uid is not null;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists protect_oyms_member_workflow_fields on public.member_records;
create trigger protect_oyms_member_workflow_fields
before insert or update on public.member_records
for each row execute function public.guard_oyms_member_workflow_fields();
