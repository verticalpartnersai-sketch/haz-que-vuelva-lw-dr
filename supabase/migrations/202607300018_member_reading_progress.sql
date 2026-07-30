create table public.member_reading_progress (
  member_id uuid not null references public.profiles(id) on delete cascade,
  product_code text not null references public.products(code) on delete cascade,
  progress_percent smallint not null default 0,
  last_opened_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (member_id, product_code),
  constraint member_reading_progress_percent_range
    check (progress_percent between 0 and 100),
  constraint member_reading_progress_completion_consistent
    check (completed_at is null or progress_percent = 100)
);

alter table public.member_reading_progress enable row level security;

create policy "member reads own reading progress"
on public.member_reading_progress for select to authenticated
using (member_id = (select auth.uid()));

grant select on public.member_reading_progress to authenticated;

create or replace function public.set_member_reading_progress(
  p_product_code text,
  p_progress_percent integer
)
returns table (
  progress_percent smallint,
  completed_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid := auth.uid();
  progress_row public.member_reading_progress;
begin
  if v_member_id is null then
    raise exception 'authentication_required';
  end if;

  if p_progress_percent is null
    or p_progress_percent < 0
    or p_progress_percent > 100 then
    raise exception 'reading_progress_out_of_bounds';
  end if;

  if not exists (
    select 1
    from public.effective_entitlements as entitlement
    where entitlement.member_id = v_member_id
      and entitlement.product_code = p_product_code
      and exists (
        select 1
        from public.content_items as item
        where item.product_code = entitlement.product_code
          and item.kind = 'pdf'
          and item.active
      )
  ) then
    raise exception 'reading_progress_access_denied';
  end if;

  insert into public.member_reading_progress (
    member_id,
    product_code,
    progress_percent,
    last_opened_at,
    completed_at,
    updated_at
  )
  values (
    v_member_id,
    p_product_code,
    p_progress_percent,
    now(),
    case when p_progress_percent = 100 then now() else null end,
    now()
  )
  on conflict (member_id, product_code) do update
  set progress_percent = excluded.progress_percent,
      last_opened_at = now(),
      completed_at = case
        when excluded.progress_percent = 100
          then coalesce(
            public.member_reading_progress.completed_at,
            now()
          )
        else null
      end,
      updated_at = now()
  returning * into progress_row;

  return query
  select
    progress_row.progress_percent,
    progress_row.completed_at,
    progress_row.updated_at;
end;
$$;

revoke all on function public.set_member_reading_progress(text, integer)
from public, anon;
grant execute on function public.set_member_reading_progress(text, integer)
to authenticated;
