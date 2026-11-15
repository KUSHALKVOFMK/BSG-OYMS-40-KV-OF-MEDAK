-- Use the least-privileged portal role as the default for newly created profiles.
alter table public.profiles alter column role set default 'patrol_leader';
