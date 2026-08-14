create table if not exists public.checkout_recovery_rollout (
  id text primary key default 'global' check (id = 'global'),
  enabled boolean not null default false,
  enabled_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.checkout_recovery_rollout (id, enabled)
values ('global', false)
on conflict (id) do nothing;

create table if not exists public.checkout_recovery_sequences (
  id uuid primary key default extensions.gen_random_uuid(),
  purchase_id uuid not null unique references public.purchases(id) on delete cascade,
  status text not null default 'active' check (
    status in ('active', 'converted', 'unsubscribed', 'suppressed', 'completed', 'stopped')
  ),
  unsubscribe_token uuid not null unique default extensions.gen_random_uuid(),
  started_at timestamptz not null default now(),
  stopped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_marketing_suppressions (
  topic text not null,
  recipient_sha256 text not null check (recipient_sha256 ~ '^[0-9a-f]{64}$'),
  source text not null check (source in ('one_click', 'admin', 'import')),
  sequence_id uuid references public.checkout_recovery_sequences(id) on delete set null,
  suppressed_at timestamptz not null default now(),
  lifted_at timestamptz,
  primary key (topic, recipient_sha256)
);

create table if not exists public.checkout_recovery_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  sequence_id uuid not null references public.checkout_recovery_sequences(id) on delete cascade,
  step integer not null check (step between 1 and 3),
  outbox_job_id uuid not null unique references public.outbox_jobs(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','sending','sent','delivered','opened','clicked','skipped','suppressed','failed')),
  provider_message_id text unique,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (sequence_id, step)
);

create index if not exists checkout_recovery_messages_provider_idx
on public.checkout_recovery_messages (provider_message_id)
where provider_message_id is not null;

create index if not exists checkout_recovery_sequences_status_idx
on public.checkout_recovery_sequences (status, started_at);

create index if not exists email_marketing_suppressions_active_idx
on public.email_marketing_suppressions (topic, recipient_sha256)
where lifted_at is null;

alter table public.checkout_recovery_rollout enable row level security;
alter table public.checkout_recovery_sequences enable row level security;
alter table public.checkout_recovery_messages enable row level security;
alter table public.email_marketing_suppressions enable row level security;

create or replace function public.prevent_checkout_recovery_status_regression()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status in ('approved', 'authorized', 'completed', 'cancelled', 'refunded', 'charged_back')
    and new.status = 'precheckout' then
    new.status := old.status;
    new.occurred_at := greatest(old.occurred_at, new.occurred_at);
  end if;
  return new;
end;
$$;

create trigger prevent_checkout_recovery_status_regression
  before update of status on public.purchases
  for each row execute function public.prevent_checkout_recovery_status_regression();

create or replace function public.schedule_checkout_recovery_from_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  purchase_row public.purchases%rowtype;
  v_sequence_id uuid;
begin
  if not exists (
    select 1
    from public.checkout_recovery_rollout as rollout
    where rollout.id = 'global' and rollout.enabled
  ) then
    return new;
  end if;

  if new.product_code <> 'haz_que_vuelva' then
    return new;
  end if;

  select purchase.*
  into purchase_row
  from public.purchases as purchase
  where purchase.id = new.purchase_id;

  if purchase_row.id is null
    or purchase_row.status <> 'precheckout'
    or lower(trim(purchase_row.customer_email)) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or length(lower(trim(purchase_row.customer_email))) > 254
    or lower(purchase_row.customer_email) ~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)'
    or lower(purchase_row.external_sale_code) ~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)'
  then
    return new;
  end if;

  if exists (
    select 1
    from public.purchases as buyer_purchase
    join public.purchase_items as buyer_item
      on buyer_item.purchase_id = buyer_purchase.id
    where buyer_purchase.id <> purchase_row.id
      and lower(trim(buyer_purchase.customer_email)) = lower(trim(purchase_row.customer_email))
      and buyer_purchase.status in ('approved', 'authorized', 'completed')
      and buyer_item.product_code = 'haz_que_vuelva'
  ) then
    return new;
  end if;

  insert into public.checkout_recovery_sequences (purchase_id)
  values (purchase_row.id)
  on conflict (purchase_id) do nothing
  returning id into v_sequence_id;

  if v_sequence_id is null then
    select sequence.id
    into v_sequence_id
    from public.checkout_recovery_sequences as sequence
    where sequence.purchase_id = purchase_row.id;
  end if;

  insert into public.outbox_jobs (
    job_type,
    aggregate_type,
    aggregate_id,
    idempotency_key,
    payload,
    available_at
  )
  values
    (
      'send_checkout_recovery',
      'checkout_recovery',
      v_sequence_id::text,
      'checkout-recovery/' || v_sequence_id::text || '/1',
      jsonb_build_object('sequence_id', v_sequence_id, 'step', 1),
      now() + interval '30 minutes'
    ),
    (
      'send_checkout_recovery',
      'checkout_recovery',
      v_sequence_id::text,
      'checkout-recovery/' || v_sequence_id::text || '/2',
      jsonb_build_object('sequence_id', v_sequence_id, 'step', 2),
      now() + interval '8 hours'
    ),
    (
      'send_checkout_recovery',
      'checkout_recovery',
      v_sequence_id::text,
      'checkout-recovery/' || v_sequence_id::text || '/3',
      jsonb_build_object('sequence_id', v_sequence_id, 'step', 3),
      now() + interval '24 hours'
    )
  on conflict (idempotency_key) do nothing;

  insert into public.checkout_recovery_messages (sequence_id, step, outbox_job_id)
  select
    v_sequence_id,
    step_row.step,
    job.id
  from (values (1), (2), (3)) as step_row(step)
  join public.outbox_jobs as job
    on job.idempotency_key = 'checkout-recovery/' || v_sequence_id::text || '/' || step_row.step::text
  on conflict (sequence_id, step) do nothing;

  return new;
end;
$$;

create or replace function public.stop_checkout_recovery_on_purchase_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sequence_id uuid;
  v_sequence_status text;
begin
  if old.status = new.status or new.status = 'precheckout' then
    return new;
  end if;

  select sequence.id
  into v_sequence_id
  from public.checkout_recovery_sequences as sequence
  where sequence.purchase_id = new.id;

  if v_sequence_id is null then
    return new;
  end if;

  v_sequence_status := case
    when new.status in ('approved', 'authorized', 'completed') then 'converted'
    else 'stopped'
  end;

  update public.checkout_recovery_sequences
  set
    status = v_sequence_status,
    stopped_at = now(),
    updated_at = now()
  where id = v_sequence_id
    and status = 'active';

  update public.outbox_jobs
  set
    completed_at = now(),
    locked_at = null,
    last_error = case
      when v_sequence_status = 'converted' then 'checkout_converted'
      else 'checkout_status_changed'
    end
  where job_type = 'send_checkout_recovery'
    and aggregate_id = v_sequence_id::text
    and completed_at is null
    and failed_at is null;

  update public.checkout_recovery_messages
  set status = 'skipped'
  where sequence_id = v_sequence_id
    and status in ('queued', 'sending');

  return new;
end;
$$;

create trigger schedule_checkout_recovery_after_item
  after insert or update of product_code on public.purchase_items
  for each row execute function public.schedule_checkout_recovery_from_item();

create trigger stop_checkout_recovery_after_purchase_status
  after update of status on public.purchases
  for each row
  when (new.status <> 'precheckout')
  execute function public.stop_checkout_recovery_on_purchase_status();

create or replace function public.resolve_checkout_recovery_sequence(
  p_sequence_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'sequence_id', sequence.id,
    'purchase_status', purchase.status,
    'recipient', lower(trim(purchase.customer_email)),
    'unsubscribe_token', sequence.unsubscribe_token,
    'globally_suppressed', exists (
      select 1
      from public.email_suppressions as global_suppression
      where global_suppression.recipient_sha256 = encode(
        extensions.digest(lower(trim(purchase.customer_email)), 'sha256'),
        'hex'
      )
        and global_suppression.lifted_at is null
    ),
    'marketing_suppressed', exists (
      select 1
      from public.email_marketing_suppressions as marketing_suppression
      where marketing_suppression.topic = 'checkout_recovery'
        and marketing_suppression.recipient_sha256 = encode(
          extensions.digest(lower(trim(purchase.customer_email)), 'sha256'),
          'hex'
        )
        and marketing_suppression.lifted_at is null
    )
  )
  from public.checkout_recovery_sequences as sequence
  join public.purchases as purchase on purchase.id = sequence.purchase_id
  where sequence.id = p_sequence_id
    and sequence.status = 'active'
    and lower(trim(purchase.customer_email)) ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and length(lower(trim(purchase.customer_email))) <= 254
    and lower(purchase.customer_email) !~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)'
    and lower(purchase.external_sale_code) !~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)'
    and not exists (
      select 1
      from public.purchases as buyer_purchase
      join public.purchase_items as buyer_item
        on buyer_item.purchase_id = buyer_purchase.id
      where buyer_purchase.id <> purchase.id
        and lower(trim(buyer_purchase.customer_email)) = lower(trim(purchase.customer_email))
        and buyer_purchase.status in ('approved', 'authorized', 'completed')
        and buyer_item.product_code = 'haz_que_vuelva'
    );
$$;

create or replace function public.reserve_checkout_recovery_job(
  p_job_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows integer;
begin
  update public.checkout_recovery_messages as message
  set status = 'sending'
  from public.checkout_recovery_sequences as sequence,
       public.purchases as purchase,
       public.outbox_jobs as job
  where message.outbox_job_id = p_job_id
    and message.status = 'queued'
    and sequence.id = message.sequence_id
    and sequence.status = 'active'
    and purchase.id = sequence.purchase_id
    and purchase.status = 'precheckout'
    and job.id = p_job_id
    and job.job_type = 'send_checkout_recovery'
    and job.completed_at is null
    and job.failed_at is null
    and exists (
      select 1 from public.checkout_recovery_rollout as rollout
      where rollout.id = 'global' and rollout.enabled
    )
    and not exists (
      select 1
      from public.email_suppressions as global_suppression
      where global_suppression.recipient_sha256 = encode(
        extensions.digest(lower(trim(purchase.customer_email)), 'sha256'), 'hex'
      )
        and global_suppression.lifted_at is null
    )
    and not exists (
      select 1
      from public.email_marketing_suppressions as marketing_suppression
      where marketing_suppression.topic = 'checkout_recovery'
        and marketing_suppression.recipient_sha256 = encode(
          extensions.digest(lower(trim(purchase.customer_email)), 'sha256'), 'hex'
        )
        and marketing_suppression.lifted_at is null
    )
    and not exists (
      select 1
      from public.purchases as buyer_purchase
      join public.purchase_items as buyer_item
        on buyer_item.purchase_id = buyer_purchase.id
      where buyer_purchase.id <> purchase.id
        and lower(trim(buyer_purchase.customer_email)) = lower(trim(purchase.customer_email))
        and buyer_purchase.status in ('approved', 'authorized', 'completed')
        and buyer_item.product_code = 'haz_que_vuelva'
    );

  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

create or replace function public.complete_checkout_recovery_job(
  p_job_id uuid,
  p_outcome text,
  p_provider_message_id text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  job_row public.outbox_jobs%rowtype;
  v_step integer;
begin
  if p_outcome not in ('sent', 'converted', 'suppressed', 'ineligible') then
    raise exception 'invalid_checkout_recovery_outcome';
  end if;

  update public.outbox_jobs
  set
    completed_at = now(),
    locked_at = null,
    last_error = case when p_outcome = 'sent' then null else p_outcome end
  where id = p_job_id
    and job_type = 'send_checkout_recovery'
    and completed_at is null
    and failed_at is null
  returning * into job_row;

  if job_row.id is null then
    return;
  end if;

  update public.checkout_recovery_messages
  set
    status = case
      when p_outcome = 'sent' then 'sent'
      when p_outcome = 'suppressed' then 'suppressed'
      else 'skipped'
    end,
    provider_message_id = case
      when p_outcome = 'sent' then p_provider_message_id
      else provider_message_id
    end,
    sent_at = case when p_outcome = 'sent' then now() else sent_at end
  where outbox_job_id = p_job_id
    and (
      (p_outcome = 'sent' and status = 'sending')
      or (p_outcome <> 'sent' and status in ('queued', 'sending'))
    );

  v_step := coalesce((job_row.payload ->> 'step')::integer, 0);

  if p_outcome = 'converted' then
    update public.checkout_recovery_sequences
    set status = 'converted', stopped_at = now(), updated_at = now()
    where id::text = job_row.aggregate_id and status = 'active';

    update public.outbox_jobs
    set completed_at = now(), locked_at = null, last_error = 'converted'
    where job_type = 'send_checkout_recovery'
      and aggregate_id = job_row.aggregate_id
      and completed_at is null
      and failed_at is null;
  elsif p_outcome = 'suppressed' then
    update public.checkout_recovery_sequences
    set status = 'suppressed', stopped_at = now(), updated_at = now()
    where id::text = job_row.aggregate_id and status = 'active';
  elsif p_outcome = 'ineligible' then
    update public.checkout_recovery_sequences
    set status = 'stopped', stopped_at = now(), updated_at = now()
    where id::text = job_row.aggregate_id and status = 'active';
  elsif p_outcome = 'sent' and v_step = 3 then
    update public.checkout_recovery_sequences
    set status = 'completed', stopped_at = now(), updated_at = now()
    where id::text = job_row.aggregate_id and status = 'active';
  end if;
end;
$$;

create or replace function public.unsubscribe_checkout_recovery(
  p_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sequence_id uuid;
  v_recipient_hash text;
begin
  select
    sequence.id,
    encode(extensions.digest(lower(trim(purchase.customer_email)), 'sha256'), 'hex')
  into v_sequence_id, v_recipient_hash
  from public.checkout_recovery_sequences as sequence
  join public.purchases as purchase on purchase.id = sequence.purchase_id
  where sequence.unsubscribe_token = p_token;

  if v_sequence_id is null then
    return false;
  end if;

  insert into public.email_marketing_suppressions (
    topic,
    recipient_sha256,
    source,
    sequence_id,
    suppressed_at,
    lifted_at
  )
  values (
    'checkout_recovery',
    v_recipient_hash,
    'one_click',
    v_sequence_id,
    now(),
    null
  )
  on conflict (topic, recipient_sha256) do update
  set
    source = excluded.source,
    sequence_id = excluded.sequence_id,
    suppressed_at = excluded.suppressed_at,
    lifted_at = null;

  update public.checkout_recovery_sequences
  set status = 'unsubscribed', stopped_at = now(), updated_at = now()
  where id = v_sequence_id
    and status = 'active';

  update public.outbox_jobs
  set completed_at = now(), locked_at = null, last_error = 'unsubscribed'
  where job_type = 'send_checkout_recovery'
    and aggregate_id = v_sequence_id::text
    and completed_at is null
    and failed_at is null;

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
    'notification.checkout_recovery_unsubscribed',
    'recipient_hash',
    v_recipient_hash,
    'one_click',
    jsonb_build_object('topic', 'checkout_recovery', 'sequence_id', v_sequence_id)
  );

  return true;
end;
$$;

create or replace function public.preview_checkout_recovery_backfill(
  p_since timestamptz default now() - interval '7 days'
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with front_checkouts as (
    select
      purchase.id,
      purchase.status,
      purchase.customer_email,
      purchase.external_sale_code,
      encode(
        extensions.digest(lower(trim(purchase.customer_email)), 'sha256'),
        'hex'
      ) as recipient_hash,
      lower(trim(purchase.customer_email)) ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
        and length(lower(trim(purchase.customer_email))) <= 254 as valid_email,
      lower(purchase.customer_email) ~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)'
        or lower(purchase.external_sale_code) ~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)' as is_qa
    from public.purchases as purchase
    where purchase.occurred_at >= p_since
      and exists (
        select 1
        from public.purchase_items as item
        where item.purchase_id = purchase.id
          and item.product_code = 'haz_que_vuelva'
      )
  ), eligible_base as (
    select checkout.*,
      exists (
        select 1
        from public.email_suppressions as global_suppression
        where global_suppression.recipient_sha256 = checkout.recipient_hash
          and global_suppression.lifted_at is null
      ) or exists (
        select 1
        from public.email_marketing_suppressions as marketing_suppression
        where marketing_suppression.topic = 'checkout_recovery'
          and marketing_suppression.recipient_sha256 = checkout.recipient_hash
          and marketing_suppression.lifted_at is null
      ) as is_suppressed
    from front_checkouts as checkout
  )
  select jsonb_build_object(
    'total_checkouts', count(*),
    'precheckout', count(*) filter (where status = 'precheckout'),
    'paid_excluded', count(*) filter (where status in ('approved', 'authorized', 'completed')),
    'qa_excluded', count(*) filter (where is_qa),
    'invalid_excluded', count(*) filter (where not valid_email),
    'suppressed_excluded', count(*) filter (where is_suppressed),
    'duplicates_excluded', greatest(
      count(*) filter (where status = 'precheckout' and valid_email and not is_qa and not is_suppressed)
      - count(distinct recipient_hash) filter (
        where status = 'precheckout' and valid_email and not is_qa and not is_suppressed
      ),
      0
    ),
    'eligible_unique', count(distinct recipient_hash) filter (
      where status = 'precheckout' and valid_email and not is_qa and not is_suppressed
    )
  )
  from eligible_base;
$$;

create or replace function public.record_checkout_recovery_engagement(
  p_provider_message_id text,
  p_event_type text,
  p_occurred_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_type not in ('email.opened', 'email.clicked') then
    raise exception 'unsupported_checkout_recovery_engagement';
  end if;

  update public.checkout_recovery_messages
  set
    status = case
      when p_event_type = 'email.clicked' then 'clicked'
      when status = 'clicked' then status
      else 'opened'
    end,
    opened_at = case when p_event_type = 'email.opened' then coalesce(opened_at, p_occurred_at) else opened_at end,
    clicked_at = case when p_event_type = 'email.clicked' then coalesce(clicked_at, p_occurred_at) else clicked_at end
  where provider_message_id = p_provider_message_id;

  return found;
end;
$$;

revoke all on table public.checkout_recovery_rollout from public, anon, authenticated;
revoke all on table public.checkout_recovery_sequences from public, anon, authenticated;
revoke all on table public.checkout_recovery_messages from public, anon, authenticated;
revoke all on table public.email_marketing_suppressions from public, anon, authenticated;

revoke all on function public.prevent_checkout_recovery_status_regression() from public, anon, authenticated;
revoke all on function public.schedule_checkout_recovery_from_item() from public, anon, authenticated;
revoke all on function public.stop_checkout_recovery_on_purchase_status() from public, anon, authenticated;
revoke all on function public.resolve_checkout_recovery_sequence(uuid) from public, anon, authenticated;
revoke all on function public.reserve_checkout_recovery_job(uuid) from public, anon, authenticated;
revoke all on function public.complete_checkout_recovery_job(uuid, text, text) from public, anon, authenticated;
revoke all on function public.unsubscribe_checkout_recovery(uuid) from public, anon, authenticated;
revoke all on function public.preview_checkout_recovery_backfill(timestamptz) from public, anon, authenticated;
revoke all on function public.record_checkout_recovery_engagement(text, text, timestamptz) from public, anon, authenticated;

grant execute on function public.resolve_checkout_recovery_sequence(uuid) to service_role;
grant execute on function public.reserve_checkout_recovery_job(uuid) to service_role;
grant execute on function public.complete_checkout_recovery_job(uuid, text, text) to service_role;
grant execute on function public.unsubscribe_checkout_recovery(uuid) to service_role;
grant execute on function public.preview_checkout_recovery_backfill(timestamptz) to service_role;
grant execute on function public.record_checkout_recovery_engagement(text, text, timestamptz) to service_role;
