-- OYMS 4.0 hardening: keep helper RPCs unavailable to anonymous users,
-- prevent clients from invoking trigger-only guards, and correct email validation.
revoke execute on function public.current_role() from public, anon;
grant execute on function public.current_role() to authenticated;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

revoke all on function public.guard_oyms_member_workflow_fields() from public, anon, authenticated;
revoke all on function public.guard_oyms_profile_role_fields() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

do $block$
declare fn text;
begin
  select pg_get_functiondef('public.guard_oyms_member_workflow_fields()'::regprocedure) into fn;
  fn := replace(fn, chr(92)||chr(92)||'.', chr(92)||'.');
  execute fn;
end
$block$;

comment on function public.current_role() is
'RLS helper: returns only the authenticated caller profile role. EXECUTE is intentionally limited to authenticated because policies depend on it.';
comment on function public.is_staff() is
'RLS helper: returns whether the authenticated caller is the Super Admin. EXECUTE is intentionally limited to authenticated because policies depend on it.';
