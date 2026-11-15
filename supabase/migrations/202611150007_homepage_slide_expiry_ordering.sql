-- Homepage slideshow expiry support
alter table public.homepage_slides add column if not exists expires_at timestamptz;
create index if not exists homepage_slides_active_sort_idx on public.homepage_slides (is_active, sort_order, created_at);

-- Keep existing active slides in a deterministic display order.
with ranked as (
  select id, row_number() over (order by sort_order asc, created_at asc, id asc) - 1 as new_order
  from public.homepage_slides
  where is_active = true
)
update public.homepage_slides h
set sort_order = ranked.new_order
from ranked
where h.id = ranked.id;
