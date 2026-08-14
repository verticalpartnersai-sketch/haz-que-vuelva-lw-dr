create or replace function public.retry_checkout_recovery_job(
  p_job_id uuid,
  p_error text,
  p_available_at timestamptz,
  p_terminal boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  job_row public.outbox_jobs%rowtype;
begin
  update public.outbox_jobs
  set
    available_at = p_available_at,
    failed_at = case when p_terminal then now() else null end,
    last_error = left(coalesce(p_error, 'unknown_error'), 500),
    locked_at = null
  where id = p_job_id
    and job_type = 'send_checkout_recovery'
    and completed_at is null
    and failed_at is null
  returning * into job_row;

  if job_row.id is null then
    return;
  end if;

  if p_terminal then
    update public.checkout_recovery_messages
    set status = 'failed'
    where outbox_job_id = p_job_id
      and status in ('queued', 'sending');
  end if;
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
  v_sequence_id uuid;
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

  v_sequence_id := job_row.aggregate_id::uuid;

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

  if p_outcome in ('converted', 'suppressed', 'ineligible') then
    update public.checkout_recovery_sequences
    set
      status = case
        when p_outcome = 'converted' then 'converted'
        when p_outcome = 'suppressed' then 'suppressed'
        else 'stopped'
      end,
      stopped_at = now(),
      updated_at = now()
    where id = v_sequence_id
      and status = 'active';

    update public.outbox_jobs
    set
      completed_at = now(),
      locked_at = null,
      last_error = p_outcome
    where job_type = 'send_checkout_recovery'
      and aggregate_id = job_row.aggregate_id
      and completed_at is null
      and failed_at is null;

    update public.checkout_recovery_messages
    set status = case
      when p_outcome = 'suppressed' then 'suppressed'
      else 'skipped'
    end
    where sequence_id = v_sequence_id
      and status in ('queued', 'sending');
  elsif p_outcome = 'sent' and v_step = 3 then
    update public.checkout_recovery_sequences
    set status = 'completed', stopped_at = now(), updated_at = now()
    where id = v_sequence_id
      and status = 'active';
  end if;
end;
$$;

revoke all on function public.retry_checkout_recovery_job(uuid, text, timestamptz, boolean) from public;
revoke all on function public.retry_checkout_recovery_job(uuid, text, timestamptz, boolean) from anon;
revoke all on function public.retry_checkout_recovery_job(uuid, text, timestamptz, boolean) from authenticated;
grant execute on function public.retry_checkout_recovery_job(uuid, text, timestamptz, boolean) to service_role;

revoke all on function public.complete_checkout_recovery_job(uuid, text, text) from public;
revoke all on function public.complete_checkout_recovery_job(uuid, text, text) from anon;
revoke all on function public.complete_checkout_recovery_job(uuid, text, text) from authenticated;
grant execute on function public.complete_checkout_recovery_job(uuid, text, text) to service_role;

notify pgrst, 'reload schema';
