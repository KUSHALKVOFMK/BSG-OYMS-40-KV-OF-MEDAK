create sequence if not exists public.member_login_id_seq start 1;

alter table public.member_records
  add column if not exists member_login_id text;

create unique index if not exists member_records_member_login_id_uidx
  on public.member_records(member_login_id)
  where member_login_id is not null;

create or replace function public.assign_member_login_id_on_approval()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.final_status = 'approved'
     and (tg_op = 'INSERT' or old.final_status is distinct from 'approved')
     and new.member_login_id is null then
    new.member_login_id := 'BSG-M-2026-' || lpad(nextval('public.member_login_id_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_member_login_id_on_approval on public.member_records;
create trigger trg_assign_member_login_id_on_approval
before insert or update of final_status on public.member_records
for each row execute function public.assign_member_login_id_on_approval();
