-- OYMS Sankalp 4.0: allow a Patrol Leader to clear the first-login
-- password-change gate on their own profile after changing the temporary password.
-- Row-level security still restricts the update to the caller's permitted profile row.
grant update (must_change_password) on table public.profiles to authenticated;
