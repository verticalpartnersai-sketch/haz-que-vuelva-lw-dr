create table public.email_delivery_events (
  id bigint generated always as identity primary key,
  provider text not null default 'resend'
    check (provider = 'resend'),
  provider_event_id text not null
    check (length(provider_event_id) between 1 and 200),
  provider_message_id text not null
    check (length(provider_message_id) between 1 and 200),
  event_type text not null check (
    event_type in (
      'email.delivered',
      'email.delivery_delayed',
      'email.bounced',
      'email.complained',
      'email.failed',
      'email.suppressed'
    )
  ),
  member_id uuid references public.profiles(id) on delete set null,
  recipient_sha256 text not null
    check (recipient_sha256 ~ '^[0-9a-f]{64}$'),
  detail_code text,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  unique (provider_event_id, recipient_sha256)
);

create table public.email_suppressions (
  recipient_sha256 text primary key
    check (recipient_sha256 ~ '^[0-9a-f]{64}$'),
  member_id uuid references public.profiles(id) on delete set null,
  provider text not null default 'resend'
    check (provider = 'resend'),
  reason text not null check (
    reason in ('email.bounced', 'email.complained', 'email.suppressed')
  ),
  provider_event_id text not null,
  suppressed_at timestamptz not null default now(),
  lifted_at timestamptz
);

create index email_delivery_events_member_idx
on public.email_delivery_events (member_id, occurred_at desc)
where member_id is not null;

create index email_suppressions_active_member_idx
on public.email_suppressions (member_id)
where lifted_at is null and member_id is not null;

alter table public.email_delivery_events enable row level security;
alter table public.email_suppressions enable row level security;

create policy "owner reads email delivery events at aal2"
on public.email_delivery_events
for select
to authenticated
using (
  (select public.is_admin())
  and (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "owner reads email suppressions at aal2"
on public.email_suppressions
for select
to authenticated
using (
  (select public.is_admin())
  and (select auth.jwt() ->> 'aal') = 'aal2'
);

grant select on public.email_delivery_events, public.email_suppressions
to authenticated;

create or replace function public.record_resend_email_event(
  p_provider_event_id text,
  p_provider_message_id text,
  p_event_type text,
  p_recipient_email text,
  p_occurred_at timestamptz,
  p_detail_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(p_recipient_email));
  recipient_hash text;
  matched_member_id uuid;
  event_was_inserted boolean;
begin
  if length(trim(p_provider_event_id)) not between 1 and 200
    or length(trim(p_provider_message_id)) not between 1 and 200 then
    raise exception 'invalid_resend_event_identifier';
  end if;
  if p_event_type not in (
    'email.delivered',
    'email.delivery_delayed',
    'email.bounced',
    'email.complained',
    'email.failed',
    'email.suppressed'
  ) then
    raise exception 'unsupported_resend_event_type';
  end if;
  if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or length(normalized_email) > 254 then
    raise exception 'invalid_resend_recipient';
  end if;
  if p_occurred_at is null then
    raise exception 'missing_resend_occurred_at';
  end if;

  recipient_hash := encode(
    extensions.digest(normalized_email, 'sha256'),
    'hex'
  );

  select profile.id
  into matched_member_id
  from public.profiles as profile
  where lower(profile.email) = normalized_email
  limit 1;

  insert into public.email_delivery_events (
    provider_event_id,
    provider_message_id,
    event_type,
    member_id,
    recipient_sha256,
    detail_code,
    occurred_at
  )
  values (
    trim(p_provider_event_id),
    trim(p_provider_message_id),
    p_event_type,
    matched_member_id,
    recipient_hash,
    nullif(left(trim(coalesce(p_detail_code, '')), 160), ''),
    p_occurred_at
  )
  on conflict (provider_event_id, recipient_sha256) do nothing
  returning true into event_was_inserted;

  if not coalesce(event_was_inserted, false) then
    return false;
  end if;

  if p_event_type in (
    'email.bounced',
    'email.complained',
    'email.suppressed'
  ) then
    insert into public.email_suppressions (
      recipient_sha256,
      member_id,
      reason,
      provider_event_id,
      suppressed_at,
      lifted_at
    )
    values (
      recipient_hash,
      matched_member_id,
      p_event_type,
      trim(p_provider_event_id),
      p_occurred_at,
      null
    )
    on conflict (recipient_sha256) do update
    set
      member_id = excluded.member_id,
      reason = excluded.reason,
      provider_event_id = excluded.provider_event_id,
      suppressed_at = excluded.suppressed_at,
      lifted_at = null;

    insert into public.audit_log (
      actor_id,
      action,
      target_type,
      target_id,
      reason,
      metadata
    )
    values (
      null,
      'notification.email_suppressed',
      case when matched_member_id is null then 'recipient_hash' else 'profile' end,
      coalesce(matched_member_id::text, recipient_hash),
      p_event_type,
      jsonb_build_object(
        'provider', 'resend',
        'provider_event_id', trim(p_provider_event_id),
        'provider_message_id', trim(p_provider_message_id)
      )
    );
  end if;

  return true;
end;
$$;

revoke all on function public.record_resend_email_event(
  text,
  text,
  text,
  text,
  timestamptz,
  text
) from public, anon, authenticated;

grant execute on function public.record_resend_email_event(
  text,
  text,
  text,
  text,
  timestamptz,
  text
) to service_role;
