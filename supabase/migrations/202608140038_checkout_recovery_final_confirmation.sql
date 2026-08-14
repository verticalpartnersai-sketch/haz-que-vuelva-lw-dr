create or replace function public.confirm_checkout_recovery_job(
  p_job_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.checkout_recovery_messages as message
    join public.checkout_recovery_sequences as sequence
      on sequence.id = message.sequence_id
    join public.purchases as purchase
      on purchase.id = sequence.purchase_id
    join public.outbox_jobs as job
      on job.id = message.outbox_job_id
    where message.outbox_job_id = p_job_id
      and message.status = 'sending'
      and sequence.status = 'active'
      and purchase.status = 'precheckout'
      and job.job_type = 'send_checkout_recovery'
      and job.completed_at is null
      and job.failed_at is null
      and lower(trim(purchase.customer_email)) ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
      and length(lower(trim(purchase.customer_email))) <= 254
      and lower(purchase.customer_email) !~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)'
      and lower(purchase.external_sale_code) !~ '(alexqa|qa_no_conversion|checkout_audit|postdeploy|qa-20260814)'
      and exists (
        select 1
        from public.checkout_recovery_rollout as rollout
        where rollout.id = 'global' and rollout.enabled
      )
      and not exists (
        select 1
        from public.email_suppressions as global_suppression
        where global_suppression.recipient_sha256 = encode(
          extensions.digest(lower(trim(purchase.customer_email)), 'sha256'),
          'hex'
        )
          and global_suppression.lifted_at is null
      )
      and not exists (
        select 1
        from public.email_marketing_suppressions as marketing_suppression
        where marketing_suppression.topic = 'checkout_recovery'
          and marketing_suppression.recipient_sha256 = encode(
            extensions.digest(lower(trim(purchase.customer_email)), 'sha256'),
            'hex'
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
      )
  );
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
    select
      checkout.*,
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
      ) as is_suppressed,
      exists (
        select 1
        from public.purchases as buyer_purchase
        join public.purchase_items as buyer_item
          on buyer_item.purchase_id = buyer_purchase.id
        where buyer_purchase.id <> checkout.id
          and lower(trim(buyer_purchase.customer_email)) = lower(trim(checkout.customer_email))
          and buyer_purchase.status in ('approved', 'authorized', 'completed')
          and buyer_item.product_code = 'haz_que_vuelva'
      ) as has_paid_purchase
    from front_checkouts as checkout
  )
  select jsonb_build_object(
    'total_checkouts', count(*),
    'precheckout', count(*) filter (where status = 'precheckout'),
    'paid_excluded', count(*) filter (
      where status in ('approved', 'authorized', 'completed') or has_paid_purchase
    ),
    'qa_excluded', count(*) filter (where is_qa),
    'invalid_excluded', count(*) filter (where not valid_email),
    'suppressed_excluded', count(*) filter (where is_suppressed),
    'duplicates_excluded', greatest(
      count(*) filter (
        where status = 'precheckout'
          and valid_email
          and not is_qa
          and not is_suppressed
          and not has_paid_purchase
      )
      - count(distinct recipient_hash) filter (
        where status = 'precheckout'
          and valid_email
          and not is_qa
          and not is_suppressed
          and not has_paid_purchase
      ),
      0
    ),
    'eligible_unique', count(distinct recipient_hash) filter (
      where status = 'precheckout'
        and valid_email
        and not is_qa
        and not is_suppressed
        and not has_paid_purchase
    )
  )
  from eligible_base;
$$;

revoke all on function public.confirm_checkout_recovery_job(uuid) from public, anon, authenticated;
revoke all on function public.preview_checkout_recovery_backfill(timestamptz) from public, anon, authenticated;
grant execute on function public.confirm_checkout_recovery_job(uuid) to service_role;
grant execute on function public.preview_checkout_recovery_backfill(timestamptz) to service_role;

notify pgrst, 'reload schema';
