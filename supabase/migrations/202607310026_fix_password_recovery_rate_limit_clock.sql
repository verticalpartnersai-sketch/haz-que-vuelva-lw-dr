create or replace function public.claim_password_recovery_request(
  p_recipient_email text,
  p_client_sha256 text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(p_recipient_email));
  recipient_hash text;
  request_time timestamptz := clock_timestamp();
  client_limit public.password_recovery_rate_limits%rowtype;
  recipient_limit public.password_recovery_rate_limits%rowtype;
begin
  if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or length(normalized_email) > 254 then
    raise exception 'invalid_recovery_recipient';
  end if;
  if p_client_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_recovery_client';
  end if;

  recipient_hash := encode(
    extensions.digest(normalized_email, 'sha256'),
    'hex'
  );

  perform pg_advisory_xact_lock(
    hashtextextended('password-recovery-client:' || p_client_sha256, 0)
  );
  perform pg_advisory_xact_lock(
    hashtextextended('password-recovery-recipient:' || recipient_hash, 0)
  );

  select limits.*
  into client_limit
  from public.password_recovery_rate_limits as limits
  where limits.scope_kind = 'client'
    and limits.scope_sha256 = p_client_sha256;

  select limits.*
  into recipient_limit
  from public.password_recovery_rate_limits as limits
  where limits.scope_kind = 'recipient'
    and limits.scope_sha256 = recipient_hash;

  if client_limit.scope_sha256 is not null
    and client_limit.window_started_at > request_time - interval '15 minutes'
    and client_limit.attempts >= 8 then
    return false;
  end if;

  if recipient_limit.scope_sha256 is not null
    and recipient_limit.last_attempt_at > request_time - interval '60 seconds' then
    return false;
  end if;

  insert into public.password_recovery_rate_limits (
    scope_kind,
    scope_sha256,
    window_started_at,
    attempts,
    last_attempt_at
  )
  values ('client', p_client_sha256, request_time, 1, request_time)
  on conflict (scope_kind, scope_sha256) do update
  set
    window_started_at = case
      when password_recovery_rate_limits.window_started_at
        <= request_time - interval '15 minutes'
        then request_time
      else password_recovery_rate_limits.window_started_at
    end,
    attempts = case
      when password_recovery_rate_limits.window_started_at
        <= request_time - interval '15 minutes'
        then 1
      else password_recovery_rate_limits.attempts + 1
    end,
    last_attempt_at = request_time;

  insert into public.password_recovery_rate_limits (
    scope_kind,
    scope_sha256,
    window_started_at,
    attempts,
    last_attempt_at
  )
  values ('recipient', recipient_hash, request_time, 1, request_time)
  on conflict (scope_kind, scope_sha256) do update
  set
    window_started_at = request_time,
    attempts = password_recovery_rate_limits.attempts + 1,
    last_attempt_at = request_time;

  delete from public.password_recovery_rate_limits
  where last_attempt_at < request_time - interval '7 days';

  return true;
end;
$$;

revoke all on function public.claim_password_recovery_request(text, text)
from public, anon, authenticated;

grant execute on function public.claim_password_recovery_request(text, text)
to service_role;
