-- Support Scouts, Guides, Cubs and Bulbuls and align OYMS status values with the UI.
alter table public.profiles drop constraint if exists profiles_category_check;
alter table public.profiles add constraint profiles_category_check
  check (category is null or category in ('Scout','Guide','Cub','Bulbul'));

alter table public.member_records drop constraint if exists member_records_category_check;
alter table public.member_records add constraint member_records_category_check
  check (category in ('Scout','Guide','Cub','Bulbul'));

alter table public.member_records drop constraint if exists member_records_oms_status_check;
update public.member_records set oms_status='completed' where oms_status='updated';
alter table public.member_records add constraint member_records_oms_status_check
  check (oms_status in ('not_updated','in_progress','completed'));
