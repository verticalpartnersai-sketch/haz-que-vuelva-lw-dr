create table public.admin_reauthentication_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

alter table public.admin_reauthentication_sessions enable row level security;
revoke all on public.admin_reauthentication_sessions
from public, anon, authenticated;

drop policy if exists "admin manages content" on public.content_items;
drop policy if exists "admin manages content files" on public.content_files;
drop policy if exists "admin manages private objects" on storage.objects;

revoke insert, update, delete on public.content_items
from authenticated;
revoke insert, update, delete on public.content_files
from authenticated;

create index admin_reauthentication_sessions_expiry_idx
on public.admin_reauthentication_sessions (expires_at);

create or replace function public.begin_admin_reauthentication(
  p_actor_id uuid,
  p_token_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role_required';
  end if;
  if not exists (
    select 1
    from public.profiles
    where id = p_actor_id and role = 'admin'
  ) then
    raise exception 'admin_role_required';
  end if;
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_admin_reauthentication_token';
  end if;

  delete from public.admin_reauthentication_sessions
  where expires_at <= now()
    or actor_id = p_actor_id;

  insert into public.admin_reauthentication_sessions (
    actor_id,
    token_hash,
    expires_at
  )
  values (
    p_actor_id,
    p_token_hash,
    now() + interval '5 minutes'
  );

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    p_actor_id,
    'identity.admin_reauthenticated',
    'profile',
    p_actor_id::text,
    jsonb_build_object('expires_in_seconds', 300)
  );
end;
$$;

create or replace function public.consume_admin_reauthentication(
  p_token_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  consumed_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin_role_required';
  end if;
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_admin_reauthentication_token';
  end if;

  delete from public.admin_reauthentication_sessions
  where actor_id = auth.uid()
    and token_hash = p_token_hash
    and expires_at > now()
  returning id into consumed_id;

  if consumed_id is null then
    raise exception 'admin_reauthentication_required'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.begin_admin_reauthentication(uuid, text)
from public, anon, authenticated;
grant execute on function public.begin_admin_reauthentication(uuid, text)
to service_role;

revoke all on function public.consume_admin_reauthentication(text)
from public, anon, authenticated;

revoke all on function public.publish_content_pdf(
  text, text, text, text, text, bigint, text
) from authenticated;

create or replace function public.publish_content_pdf_with_reauthentication(
  p_product_code text,
  p_title text,
  p_storage_bucket text,
  p_storage_path text,
  p_sha256 text,
  p_size_bytes bigint,
  p_mime_type text,
  p_reauth_token_hash text
)
returns table (
  content_item_id uuid,
  content_file_id uuid,
  published_version integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);

  return query
  select *
  from public.publish_content_pdf(
    p_product_code,
    p_title,
    p_storage_bucket,
    p_storage_path,
    p_sha256,
    p_size_bytes,
    p_mime_type
  );
end;
$$;

revoke all on function public.publish_content_pdf_with_reauthentication(
  text, text, text, text, text, bigint, text, text
) from public, anon;
grant execute on function public.publish_content_pdf_with_reauthentication(
  text, text, text, text, text, bigint, text, text
) to authenticated;
