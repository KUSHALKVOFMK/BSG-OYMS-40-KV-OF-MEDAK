-- OYMS Sankalp 4.0: align online member record with annual BSG registration form.
-- Aadhaar column already exists in the live database; URN is added for the form.
alter table public.member_records
  add column if not exists urn_number text not null default '';

comment on column public.member_records.aadhaar_number is
  'Sensitive student identity data; school-required field. Restrict access to authorised portal users.';
comment on column public.member_records.urn_number is
  'URN number as recorded on the school/BSG annual registration form.';
