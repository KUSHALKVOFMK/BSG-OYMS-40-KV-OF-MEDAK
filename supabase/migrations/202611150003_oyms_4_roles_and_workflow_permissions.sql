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
