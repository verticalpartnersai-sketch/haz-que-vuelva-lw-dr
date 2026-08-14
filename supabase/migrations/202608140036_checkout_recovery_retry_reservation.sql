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
    and message.status in ('queued', 'sending')
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

revoke all on function public.reserve_checkout_recovery_job(uuid) from public, anon, authenticated;
grant execute on function public.reserve_checkout_recovery_job(uuid) to service_role;

notify pgrst, 'reload schema';
