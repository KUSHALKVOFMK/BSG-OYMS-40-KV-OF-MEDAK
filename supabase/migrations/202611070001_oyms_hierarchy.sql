-- OYMS 4.0 hierarchical onboarding and role-scoped access migration
-- Run after supabase/schema.sql in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  affiliation_number text default '',
  division text not null default 'KVS Hyderabad Division',
  school_address text not null default '',
  principal_name text default '',
  contact_person text not null,
  email text not null,
  mobile text default '',
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.school_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  school_name text not null,
  affiliation_number text default '',
  division text not null default 'KVS Hyderabad Division',
  school_address text not null default '',
  principal_name text default '',
  contact_person text not null,
  email text not null,
  mobile text default '',
  email_verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  school_id uuid references public.schools(id) on delete set null,
  review_notes text default '',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(applicant_user_id)
);

alter table public.profiles add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.profiles add column if not exists unit_id uuid references public.units(id) on delete set null;
alter table public.profiles add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('super_admin','school_admin','unit_leader','patrol_leader','assistant_patrol_leader','member'));

alter table public.units add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.units drop constraint if exists units_name_key;
create unique index if not exists units_school_name_unique on public.units(school_id,name) where school_id is not null;
alter table public.units add column if not exists leader_id uuid references public.profiles(id) on delete set null;
alter table public.patrols add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.patrols drop constraint if exists patrols_name_unit_key;
create unique index if not exists patrols_school_name_unit_unique on public.patrols(school_id,name,unit) where school_id is not null;
alter table public.patrols add column if not exists unit_id uuid references public.units(id) on delete cascade;
alter table public.patrols add column if not exists assistant_leader_id uuid references public.profiles(id) on delete set null;

alter table public.members add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.members add column if not exists unit_id uuid references public.units(id) on delete set null;
alter table public.members add column if not exists father_name text default '';
alter table public.members add column if not exists mother_name text default '';
alter table public.members add column if not exists troop_company text default '';
alter table public.members add column if not exists unit_address text default '';
alter table public.members add column if not exists investiture_date date;
alter table public.members add column if not exists leaving_date date;
alter table public.members add column if not exists role_in_unit text default 'Member';
alter table public.members add column if not exists stage_completion_dates jsonb not null default '{}'::jsonb;
alter table public.members add column if not exists account_status text not null default 'not_created' check (account_status in ('not_created','invited','active','disabled'));

alter table public.attendance_sessions add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.attendance_records add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.tests add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.test_results add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.progression_records add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.events add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.notices add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.certificates add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.logbook_entries add column if not exists school_id uuid references public.schools(id) on delete cascade;

create or replace function public.current_school_id()
returns uuid language sql stable security definer set search_path=public
as $$ select school_id from public.profiles where id=auth.uid() $$;

create or replace function public.current_unit_id()
returns uuid language sql stable security definer set search_path=public
as $$ select unit_id from public.profiles where id=auth.uid() $$;

create or replace function public.current_patrol_id()
returns uuid language sql stable security definer set search_path=public
as $$ select patrol_id from public.profiles where id=auth.uid() $$;

create or replace function public.can_manage_school(target_school uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_role()='super_admin' or (public.current_role()='school_admin' and public.current_school_id()=target_school),false) $$;

create or replace function public.can_manage_unit(target_unit uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(
  public.current_role()='super_admin'
  or (public.current_role()='school_admin' and public.current_school_id()=(select school_id from public.units where id=target_unit))
  or (public.current_role()='unit_leader' and public.current_unit_id()=target_unit),false) $$;

create or replace function public.can_manage_patrol(target_patrol uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(
  public.current_role()='super_admin'
  or (public.current_role()='school_admin' and public.current_school_id()=(select school_id from public.patrols where id=target_patrol))
  or (public.current_role()='unit_leader' and public.current_unit_id()=(select unit_id from public.patrols where id=target_patrol))
  or (public.current_role() in ('patrol_leader','assistant_patrol_leader') and public.current_patrol_id()=target_patrol),false) $$;

create or replace function public.enforce_patrol_capacity()
returns trigger language plpgsql security definer set search_path=public
as $$
declare member_count integer;
begin
  if new.patrol_id is null then return new; end if;
  perform 1 from public.patrols where id=new.patrol_id for update;
  select count(*) into member_count from public.members
    where patrol_id=new.patrol_id and (tg_op='INSERT' or id<>new.id);
  if member_count>=8 then raise exception 'This patrol has reached its maximum capacity of eight members.'; end if;
  return new;
end;
$$;

drop trigger if exists members_patrol_capacity on public.members;
create trigger members_patrol_capacity before insert or update of patrol_id on public.members
for each row execute function public.enforce_patrol_capacity();

alter table public.schools enable row level security;
alter table public.school_applications enable row level security;

drop policy if exists "profiles read own or staff" on public.profiles;
drop policy if exists "units readable by authenticated" on public.units;
drop policy if exists "units staff manage" on public.units;
drop policy if exists "patrols readable by authenticated" on public.patrols;
drop policy if exists "patrols staff manage" on public.patrols;
drop policy if exists "members staff read" on public.members;
drop policy if exists "members staff insert" on public.members;
drop policy if exists "members staff update" on public.members;
drop policy if exists "members staff delete" on public.members;
drop policy if exists "attendance sessions staff read" on public.attendance_sessions;
drop policy if exists "attendance sessions staff manage" on public.attendance_sessions;
drop policy if exists "attendance records staff or assigned patrol read" on public.attendance_records;
drop policy if exists "attendance records staff or assigned patrol manage" on public.attendance_records;
drop policy if exists "tests staff read" on public.tests;
drop policy if exists "tests staff manage" on public.tests;
drop policy if exists "results staff or assigned patrol manage" on public.test_results;
drop policy if exists "progression staff manage" on public.progression_records;
drop policy if exists "events authenticated read" on public.events;
drop policy if exists "events staff manage" on public.events;
drop policy if exists "notices published read" on public.notices;
drop policy if exists "notices staff manage" on public.notices;
drop policy if exists "certificates staff manage" on public.certificates;
drop policy if exists "logbook own or staff" on public.logbook_entries;
drop policy if exists "public registration submit" on public.registration_requests;
drop policy if exists "staff review registration" on public.registration_requests;

create policy "schools visible to their members" on public.schools for select to authenticated
using (id=public.current_school_id() or public.current_role()='super_admin');
create policy "schools super admin manage" on public.schools for all to authenticated
using (public.current_role()='super_admin') with check (public.current_role()='super_admin');

create policy "school application own or super admin read" on public.school_applications for select to authenticated
using (applicant_user_id=auth.uid() or public.current_role()='super_admin');
create policy "verified email submits school application" on public.school_applications for insert to authenticated
with check (applicant_user_id=auth.uid() and lower(email)=lower(auth.jwt()->>'email') and email_verified=true and status='pending');
create policy "super admin reviews school application" on public.school_applications for update to authenticated
using (public.current_role()='super_admin') with check (public.current_role()='super_admin');

create policy "profiles same school or own read" on public.profiles for select to authenticated
using (id=auth.uid() or public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));
-- Profile role, school, unit and patrol assignments are only written by trusted Edge Functions.

create policy "units same school read" on public.units for select to authenticated
using (school_id=public.current_school_id() or public.current_role()='super_admin');
create policy "units admins manage" on public.units for all to authenticated
using (public.can_manage_school(school_id)) with check (public.can_manage_school(school_id));

create policy "patrols assigned read" on public.patrols for select to authenticated
using (school_id=public.current_school_id() or public.current_role()='super_admin');
create policy "patrols unit leaders manage" on public.patrols for all to authenticated
using (public.can_manage_unit(unit_id)) with check (public.can_manage_unit(unit_id));

create policy "members scoped read" on public.members for select to authenticated
using (
  public.current_role()='super_admin'
  or (school_id=public.current_school_id() and public.current_role()='school_admin')
  or (school_id=public.current_school_id() and public.current_role()='unit_leader' and unit_id=public.current_unit_id())
  or (public.current_role() in ('patrol_leader','assistant_patrol_leader') and patrol_id=public.current_patrol_id())
  or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='member' and p.member_id=members.id)
);
create policy "unit and patrol leaders add members" on public.members for insert to authenticated
with check (
  public.current_role()='super_admin'
  or (school_id=public.current_school_id() and public.current_role()='school_admin')
  or (school_id=public.current_school_id() and public.current_role()='unit_leader' and unit_id=public.current_unit_id())
  or (school_id=public.current_school_id() and public.current_role() in ('patrol_leader','assistant_patrol_leader') and patrol_id=public.current_patrol_id())
);
create policy "leaders update scoped members" on public.members for update to authenticated
using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role()='school_admin') or (public.current_role()='unit_leader' and unit_id=public.current_unit_id()) or (public.current_role() in ('patrol_leader','assistant_patrol_leader') and patrol_id=public.current_patrol_id()))
with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role()='school_admin') or (public.current_role()='unit_leader' and unit_id=public.current_unit_id()) or (public.current_role() in ('patrol_leader','assistant_patrol_leader') and patrol_id=public.current_patrol_id()));
create policy "admins delete members" on public.members for delete to authenticated
using (public.current_role()='super_admin' or (public.current_role()='school_admin' and school_id=public.current_school_id()));

create policy "attendance sessions scoped read" on public.attendance_sessions for select to authenticated
using (school_id=public.current_school_id() or public.current_role()='super_admin');
create policy "unit leaders manage attendance sessions" on public.attendance_sessions for all to authenticated
using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')))
with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));
create policy "attendance records scoped read" on public.attendance_records for select to authenticated
using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')) or exists(select 1 from public.members m where m.id=member_id and m.patrol_id=public.current_patrol_id()));
create policy "attendance records leaders manage" on public.attendance_records for all to authenticated
using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')) or exists(select 1 from public.members m where m.id=member_id and m.patrol_id=public.current_patrol_id()))
with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')) or exists(select 1 from public.members m where m.id=member_id and m.patrol_id=public.current_patrol_id()));

create policy "tests scoped read" on public.tests for select to authenticated using (school_id=public.current_school_id() or public.current_role()='super_admin');
create policy "tests staff manage" on public.tests for all to authenticated using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader'))) with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));
create policy "test results scoped read" on public.test_results for select to authenticated using (public.current_role()='super_admin' or school_id=public.current_school_id() or exists(select 1 from public.members m where m.id=member_id and m.patrol_id=public.current_patrol_id()));
create policy "test results leaders manage" on public.test_results for all to authenticated using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')) or exists(select 1 from public.members m where m.id=member_id and m.patrol_id=public.current_patrol_id())) with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')) or exists(select 1 from public.members m where m.id=member_id and m.patrol_id=public.current_patrol_id()));

create policy "progression scoped read" on public.progression_records for select to authenticated using (public.current_role()='super_admin' or school_id=public.current_school_id() or exists(select 1 from public.members m where m.id=member_id and m.id=(select member_id from public.profiles where id=auth.uid())));
create policy "progression staff manage" on public.progression_records for all to authenticated using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader'))) with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));

create policy "events scoped read" on public.events for select to authenticated using (school_id=public.current_school_id() or public.current_role()='super_admin');
create policy "events staff manage" on public.events for all to authenticated using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader'))) with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));
create policy "notices scoped read" on public.notices for select to authenticated using ((is_published and (school_id=public.current_school_id() or public.current_role()='super_admin')) or public.current_role() in ('school_admin','unit_leader'));
create policy "notices staff manage" on public.notices for all to authenticated using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader'))) with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));
create policy "certificates scoped manage" on public.certificates for all to authenticated using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader'))) with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));
create policy "logbooks scoped" on public.logbook_entries for all to authenticated using (public.current_role()='super_admin' or school_id=public.current_school_id() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=logbook_entries.member_id)) with check (public.current_role()='super_admin' or school_id=public.current_school_id() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.member_id=logbook_entries.member_id));

create policy "registration requests no public write" on public.registration_requests for select to authenticated
using (public.current_role()='super_admin' or school_id=public.current_school_id());
create policy "registration requests staff update" on public.registration_requests for all to authenticated
using (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')))
with check (public.current_role()='super_admin' or (school_id=public.current_school_id() and public.current_role() in ('school_admin','unit_leader')));

-- Never expose Aadhaar numbers as a general member-profile field. Collect Aadhaar only if a lawful school process requires it, in a separately protected workflow.
