-- OYMS 4.0: split website ownership from operational member administration.
-- Super Admin owns public website content and creates Admin accounts.
-- Admin owns member data, patrol accounts, verification and operational workflows.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin','admin','patrol_leader'));

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_role()='super_admin',false) $$;

-- Keep the established is_staff() policy helper for operational data only.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_role()='admin',false) $$;

revoke execute on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to anon, authenticated;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

-- Profile visibility: Admin can see operational accounts; Super Admin can see
-- only their own profile and Admin accounts. Each role manages only its tier.
drop policy if exists "profiles read own or staff" on public.profiles;
create policy "profiles read by assigned administration"
on public.profiles for select to authenticated
using (
  id=auth.uid()
  or (public.is_staff() and role='patrol_leader')
  or (public.is_super_admin() and role='admin')
);
drop policy if exists "patrol leaders update own profile" on public.profiles;
create policy "profiles update within assigned administration"
on public.profiles for update to authenticated
using (
  id=auth.uid()
  or (public.is_staff() and role='patrol_leader')
  or (public.is_super_admin() and role='admin')
)
with check (
  id=auth.uid()
  or (public.is_staff() and role='patrol_leader')
  or (public.is_super_admin() and role='admin')
);

create or replace function public.guard_oyms_profile_role_fields()
returns trigger language plpgsql security definer set search_path=public
as $function$
declare actor_role text;
begin
  actor_role := public.current_role();
  if auth.uid() is not null then
    if old.role='super_admin' and auth.uid()<>old.id then
      raise exception 'The Super Admin account cannot be modified by another portal account.';
    end if;
    if old.role='admin' and actor_role='admin' and auth.uid()<>old.id then
      raise exception 'Only the Super Admin can manage Admin accounts.';
    end if;
    if old.role='patrol_leader' and actor_role='super_admin' then
      raise exception 'The Super Admin manages website settings only. Ask the Admin to manage Patrol Leader accounts.';
    end if;
    if auth.uid()=old.id and old.role in ('admin','super_admin') and (
      new.role is distinct from old.role or
      new.is_active is distinct from old.is_active or
      new.user_id is distinct from old.user_id or
      new.login_id is distinct from old.login_id
    ) then
      raise exception 'You cannot change your own role or account access settings.';
    end if;
    if auth.uid()=old.id and old.role='patrol_leader' and (
      new.role is distinct from old.role or
      new.is_active is distinct from old.is_active or
      new.user_id is distinct from old.user_id or
      new.login_id is distinct from old.login_id or
      new.patrol_name is distinct from old.patrol_name or
      new.category is distinct from old.category
    ) then
      raise exception 'Patrol Leaders cannot change role, account status, login ID, assigned patrol, or section.';
    end if;
  end if;
  return new;
end;
$function$;

-- Website management belongs exclusively to Super Admin.
drop policy if exists "public read active homepage slides" on public.homepage_slides;
create policy "public read active homepage slides" on public.homepage_slides
for select to anon, authenticated using (is_active=true or public.is_super_admin());
drop policy if exists "staff manage homepage slides" on public.homepage_slides;
create policy "super admin manages homepage slides" on public.homepage_slides
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "events staff manage" on public.events;
create policy "super admin manages events" on public.events
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "notices published read" on public.notices;
create policy "published notices public or super admin read" on public.notices
for select to authenticated using (is_published=true or public.is_super_admin());
drop policy if exists "notices staff manage" on public.notices;
create policy "super admin manages public notices" on public.notices
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "published announcements visible after schedule" on public.portal_announcements;
create policy "published announcements visible after schedule" on public.portal_announcements
for select to authenticated using ((is_published=true and scheduled_at<=now()) or public.is_super_admin());
drop policy if exists "staff manage portal announcements" on public.portal_announcements;
create policy "super admin manages portal announcements" on public.portal_announcements
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

-- Monthly membership verification is an operational task released by Admin.
drop policy if exists "released membership campaigns visible to patrol leaders and sup" on public.membership_verification_campaigns;
create policy "released membership campaigns visible to patrol leaders and admin" on public.membership_verification_campaigns
for select to authenticated using (released=true or public.is_staff());
drop policy if exists "super admin creates membership campaigns" on public.membership_verification_campaigns;
create policy "admin creates membership campaigns" on public.membership_verification_campaigns
for insert to authenticated with check (public.is_staff());
drop policy if exists "super admin updates membership campaigns" on public.membership_verification_campaigns;
create policy "admin updates membership campaigns" on public.membership_verification_campaigns
for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- Patrol Leaders send workflow notifications to Admin, not Super Admin.
create or replace function public.is_active_admin(target_user uuid)
returns boolean language sql stable security definer set search_path=public
as $ select exists(select 1 from public.profiles p where p.id=target_user and p.role='admin' and p.is_active=true) $;
revoke execute on function public.is_active_admin(uuid) from public, anon;
grant execute on function public.is_active_admin(uuid) to authenticated;

drop policy if exists "patrol leaders notify super admin about own members" on public.member_notifications;
create policy "patrol leaders notify admin about own members" on public.member_notifications
for insert to authenticated with check (
  public.is_active_admin(recipient_user_id)
  and (member_record_id is null or exists(
    select 1 from public.member_records m
    where m.id=member_record_id and m.patrol_leader_id=auth.uid()
  ))
);

-- Operational file access remains with Admin and the owning Patrol Leader.
-- Website media upload/edit/delete is Super Admin only.
drop policy if exists "staff upload homepage slide images" on storage.objects;
create policy "super admin upload homepage slide images" on storage.objects
for insert to authenticated with check (bucket_id='homepage-slides' and public.is_super_admin());
drop policy if exists "staff update homepage slide images" on storage.objects;
create policy "super admin update homepage slide images" on storage.objects
for update to authenticated using (bucket_id='homepage-slides' and public.is_super_admin())
with check (bucket_id='homepage-slides' and public.is_super_admin());
drop policy if exists "staff delete homepage slide images" on storage.objects;
create policy "super admin delete homepage slide images" on storage.objects
for delete to authenticated using (bucket_id='homepage-slides' and public.is_super_admin());

drop policy if exists "staff upload announcement media" on storage.objects;
create policy "super admin upload announcement media" on storage.objects
for insert to authenticated with check (bucket_id='portal-announcements' and public.is_super_admin());
drop policy if exists "staff update announcement media" on storage.objects;
create policy "super admin update announcement media" on storage.objects
for update to authenticated using (bucket_id='portal-announcements' and public.is_super_admin())
with check (bucket_id='portal-announcements' and public.is_super_admin());
drop policy if exists "staff delete announcement media" on storage.objects;
create policy "super admin delete announcement media" on storage.objects
for delete to authenticated using (bucket_id='portal-announcements' and public.is_super_admin());

comment on function public.is_staff() is 'RLS helper for the operational Admin role. Does not include Super Admin.';
comment on function public.is_super_admin() is 'RLS helper for Super Admin website-management permissions only.';

-- Admin owns legacy member-data operations; Super Admin cannot delete member records.
drop policy if exists "members staff delete" on public.members;
create policy "admin deletes legacy member records" on public.members
for delete to authenticated using (public.is_staff());

-- Announcement view analytics are website-management data.
drop policy if exists "users read own announcement views" on public.portal_announcement_views;
create policy "super admin reads announcement views" on public.portal_announcement_views
for select to authenticated using (public.is_super_admin() or user_id=auth.uid());
