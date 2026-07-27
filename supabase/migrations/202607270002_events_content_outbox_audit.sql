create table public.incoming_events (
  id uuid primary key default extensions.gen_random_uuid(),
  provider text not null,
  event_key text not null,
  event_type text not null,
  payload_hash text not null,
  sale_code text not null,
  customer_email text not null,
  external_product_code text not null,
  external_plan_code text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null,
  payload_redacted jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  unique (provider, event_key)
);

create table public.outbox_jobs (
  id uuid primary key default extensions.gen_random_uuid(),
  job_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  available_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  locked_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default extensions.gen_random_uuid(),
  product_code text not null references public.products(code),
  title text not null,
  kind text not null check (kind in ('pdf', 'attachment')),
  sort_order integer not null default 0,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_files (
  id uuid primary key default extensions.gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  version integer not null check (version > 0),
  sha256 text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  unique (content_item_id, version),
  unique (storage_bucket, storage_path)
);

create table public.watermarked_files (
  id uuid primary key default extensions.gen_random_uuid(),
  source_file_id uuid not null references public.content_files(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  audit_marker text not null unique,
  created_at timestamptz not null default now(),
  unique (source_file_id, member_id)
);

create table public.download_events (
  id bigint generated always as identity primary key,
  member_id uuid not null references public.profiles(id),
  source_file_id uuid not null references public.content_files(id),
  audit_marker text not null,
  occurred_at timestamptz not null default now()
);

alter table public.incoming_events enable row level security;
alter table public.outbox_jobs enable row level security;
alter table public.audit_log enable row level security;
alter table public.content_items enable row level security;
alter table public.content_files enable row level security;
alter table public.watermarked_files enable row level security;
alter table public.download_events enable row level security;

create policy "admin reads incoming events"
on public.incoming_events for select to authenticated
using ((select public.is_admin()));

create policy "admin reads outbox"
on public.outbox_jobs for select to authenticated
using ((select public.is_admin()));

create policy "admin reads audit"
on public.audit_log for select to authenticated
using ((select public.is_admin()));

create policy "entitled member reads content"
on public.content_items for select to authenticated
using (
  active and exists (
    select 1 from public.effective_entitlements
    where member_id = (select auth.uid())
      and product_code = content_items.product_code
  )
  or (select public.is_admin())
);

create policy "entitled member reads file metadata"
on public.content_files for select to authenticated
using (
  exists (
    select 1
    from public.content_items
    join public.effective_entitlements
      on effective_entitlements.product_code = content_items.product_code
    where content_items.id = content_files.content_item_id
      and effective_entitlements.member_id = (select auth.uid())
      and content_items.active
  )
  or (select public.is_admin())
);

create policy "member reads own watermarked files"
on public.watermarked_files for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member reads own download history"
on public.download_events for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "admin manages content"
on public.content_items for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admin manages content files"
on public.content_files for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.content_items, public.content_files,
  public.watermarked_files, public.download_events, public.audit_log,
  public.incoming_events, public.outbox_jobs to authenticated;
grant insert, update, delete on public.content_items,
  public.content_files to authenticated;

insert into storage.buckets (id, name, public)
values
  ('product-content', 'product-content', false),
  ('ai-knowledge', 'ai-knowledge', false),
  ('member-sensitive', 'member-sensitive', false)
on conflict (id) do update set public = false;
