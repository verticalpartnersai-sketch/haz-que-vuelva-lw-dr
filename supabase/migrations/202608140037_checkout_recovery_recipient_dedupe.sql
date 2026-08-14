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

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'checkout_recovery:' || lower(trim(purchase_row.customer_email)),
      0
    )
  );

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

  if exists (
    select 1
    from public.checkout_recovery_sequences as existing_sequence
    join public.purchases as existing_purchase
      on existing_purchase.id = existing_sequence.purchase_id
    join public.purchase_items as existing_item
      on existing_item.purchase_id = existing_purchase.id
    where existing_sequence.status = 'active'
      and existing_purchase.id <> purchase_row.id
      and lower(trim(existing_purchase.customer_email)) = lower(trim(purchase_row.customer_email))
      and existing_item.product_code = 'haz_que_vuelva'
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

revoke all on function public.schedule_checkout_recovery_from_item() from public, anon, authenticated;

notify pgrst, 'reload schema';
