alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists blood_group text,
  add column if not exists residential_address text,
  add column if not exists profile_photo_path text,
  add column if not exists profile_completed_at timestamptz;

alter table public.member_records
  add column if not exists patrol_position text not null default 'Patrol Member';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'member_records_patrol_position_check'
      and conrelid = 'public.member_records'::regclass
  ) then
    alter table public.member_records
      add constraint member_records_patrol_position_check
      check (patrol_position in ('Patrol Member','Assistant Patrol Leader'));
  end if;
end;
$$;

create unique index if not exists one_assistant_patrol_leader_per_patrol
  on public.member_records (patrol_leader_id)
  where patrol_position = 'Assistant Patrol Leader';

create or replace function public.enforce_patrol_member_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  existing_count integer;
begin
  if tg_op = 'INSERT' then
    perform pg_advisory_xact_lock(hashtextextended(new.patrol_leader_id::text, 0));
    select count(*) into existing_count
    from public.member_records
    where patrol_leader_id = new.patrol_leader_id;

    if existing_count >= 7 then
      raise exception 'A patrol can have a maximum of seven registered members plus its Patrol Leader.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_patrol_member_limit_trigger on public.member_records;
create trigger enforce_patrol_member_limit_trigger
before insert on public.member_records
for each row execute function public.enforce_patrol_member_limit();

drop policy if exists "patrol leaders update own profile" on public.profiles;
create policy "patrol leaders update own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()) or is_staff())
with check (id = (select auth.uid()) or is_staff());

revoke update on public.profiles from authenticated;
grant update (full_name, email_address, mobile_number, bsg_uid, date_of_birth, gender, blood_group, residential_address, profile_photo_path, profile_completed_at, is_active) on public.profiles to authenticated;
