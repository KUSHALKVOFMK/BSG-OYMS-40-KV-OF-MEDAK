-- Enforce the current member registration form at insert/submission time.
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

    if tg_op = 'INSERT' or new.submission_status = 'completed' then
      if coalesce(trim(new.first_name), '') = ''
         or coalesce(trim(new.middle_name), '') = ''
         or coalesce(trim(new.last_name), '') = ''
         or coalesce(trim(new.nickname), '') = ''
         or new.date_of_birth is null
         or coalesce(trim(new.gender), '') = ''
         or coalesce(trim(new.blood_group), '') = ''
         or coalesce(trim(new.aadhaar_number), '') !~ '^[0-9]{12}$'
         or coalesce(trim(new.urn_number), '') = ''
         or coalesce(trim(new.father_name), '') = ''
         or coalesce(trim(new.father_occupation), '') = ''
         or coalesce(trim(new.mother_name), '') = ''
         or coalesce(trim(new.mother_occupation), '') = ''
         or coalesce(trim(new.residential_address), '') = ''
         or coalesce(trim(new.town_village), '') = ''
         or coalesce(trim(new.district), '') = ''
         or coalesce(trim(new.state), '') = ''
         or coalesce(trim(new.pin_code), '') = ''
         or coalesce(trim(new.primary_contact), '') = ''
         or coalesce(trim(new.whatsapp_number), '') = ''
         or coalesce(trim(new.alternative_contact), '') = ''
         or coalesce(trim(new.emergency_contact), '') = ''
         or coalesce(trim(new.emergency_contact_person), '') = ''
         or coalesce(trim(new.email), '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
         or coalesce(trim(new.patrol_position), '') = ''
         or coalesce(trim(new.photo_path), '') = ''
         or coalesce(array_length(new.form_file_paths, 1), 0) not between 1 and 4 then
        raise exception 'Complete every member profile field and upload the member photograph and signed membership form. Only BSG UID is optional.';
      end if;
    end if;
  end if;

  return new;
end;
$function$;
