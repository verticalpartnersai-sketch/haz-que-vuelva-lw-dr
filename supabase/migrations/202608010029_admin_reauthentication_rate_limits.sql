create table app_private.admin_reauthentication_rate_limits (
  actor_id uuid primary key references public.profiles(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts between 1 and 5),
  last_attempt_at timestamptz not null default now(),
  locked_until timestamptz
);

revoke all on table app_private.admin_reauthentication_rate_limits
from public, anon, authenticated, service_role;

create or replace function public.reserve_admin_reauthentication_attempt(
  p_actor_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_time timestamptz := clock_timestamp();
  current_limit app_private.admin_reauthentication_rate_limits%rowtype;
  retry_after_seconds integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role_required' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.profiles as profile
    join app_private.admin_principals as principal
      on principal.email_sha256 = encode(
        extensions.digest(lower(trim(profile.email)), 'sha256'),
        'hex'
      )
    where profile.id = p_actor_id
      and profile.role = 'admin'
  ) then
    raise exception 'admin_principal_not_allowed' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('admin-reauthentication:' || p_actor_id::text, 0)
  );

  select limits.*
  into current_limit
  from app_private.admin_reauthentication_rate_limits as limits
  where limits.actor_id = p_actor_id;

  if current_limit.actor_id is null
    or current_limit.window_started_at <= request_time - interval '15 minutes' then
    insert into app_private.admin_reauthentication_rate_limits (
      actor_id,
      window_started_at,
      attempts,
      last_attempt_at,
      locked_until
    )
    values (p_actor_id, request_time, 1, request_time, null)
    on conflict (actor_id) do update
    set
      window_started_at = excluded.window_started_at,
      attempts = excluded.attempts,
      last_attempt_at = excluded.last_attempt_at,
      locked_until = excluded.locked_until;
    return 0;
  end if;

  if current_limit.locked_until > request_time then
    retry_after_seconds := greatest(
      1,
      ceil(extract(epoch from current_limit.locked_until - request_time))::integer
    );
    return least(retry_after_seconds, 900);
  end if;

  if current_limit.attempts >= 5 then
    update app_private.admin_reauthentication_rate_limits
    set
      last_attempt_at = request_time,
      locked_until = request_time + interval '15 minutes'
    where actor_id = p_actor_id;
    return 900;
  end if;

  update app_private.admin_reauthentication_rate_limits
  set
    attempts = attempts + 1,
    last_attempt_at = request_time
  where actor_id = p_actor_id;

  return 0;
end;
$$;

revoke all on function public.reserve_admin_reauthentication_attempt(uuid)
from public, anon, authenticated;
grant execute on function public.reserve_admin_reauthentication_attempt(uuid)
to service_role;

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
    raise exception 'service_role_required' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.profiles as profile
    join app_private.admin_principals as principal
      on principal.email_sha256 = encode(
        extensions.digest(lower(trim(profile.email)), 'sha256'),
        'hex'
      )
    where profile.id = p_actor_id
      and profile.role = 'admin'
  ) then
    raise exception 'admin_principal_not_allowed' using errcode = '42501';
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

  delete from app_private.admin_reauthentication_rate_limits
  where actor_id = p_actor_id;

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

revoke all on function public.begin_admin_reauthentication(uuid, text)
from public, anon, authenticated;
grant execute on function public.begin_admin_reauthentication(uuid, text)
to service_role;

comment on function public.reserve_admin_reauthentication_attempt(uuid) is
  'Atomically allows five owner password checks per fifteen-minute window and returns retry-after seconds when locked.';
