create index if not exists outbox_content_watermark_claim_idx
on public.outbox_jobs (available_at, created_at)
where job_type = 'generate_content_watermark'
  and completed_at is null
  and failed_at is null;

create or replace function public.enqueue_content_watermark(
  p_source_file_id uuid,
  p_member_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job_id uuid;
  v_idempotency_key text :=
    'content-watermark:' || p_source_file_id::text || ':' || p_member_id::text;
begin
  if not exists (
    select 1
    from public.content_files as source
    join public.content_items as item on item.id = source.content_item_id
    join public.effective_entitlements as entitlement
      on entitlement.product_code = item.product_code
    where source.id = p_source_file_id
      and item.active
      and item.kind = 'pdf'
      and source.mime_type = 'application/pdf'
      and entitlement.member_id = p_member_id
  ) then
    raise exception 'eligible content source not found'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.watermarked_files
    where source_file_id = p_source_file_id
      and member_id = p_member_id
  ) then
    return null;
  end if;

  insert into public.outbox_jobs (
    job_type,
    aggregate_type,
    aggregate_id,
    idempotency_key,
    payload
  )
  values (
    'generate_content_watermark',
    'content_file_member',
    p_source_file_id::text || ':' || p_member_id::text,
    v_idempotency_key,
    jsonb_build_object(
      'source_file_id', p_source_file_id,
      'member_id', p_member_id
    )
  )
  on conflict (idempotency_key) do update
  set
    available_at = case
      when outbox_jobs.completed_at is not null
        or outbox_jobs.failed_at is not null then now()
      else outbox_jobs.available_at
    end,
    attempts = case
      when outbox_jobs.completed_at is not null
        or outbox_jobs.failed_at is not null then 0
      else outbox_jobs.attempts
    end,
    completed_at = case
      when outbox_jobs.completed_at is not null
        or outbox_jobs.failed_at is not null then null
      else outbox_jobs.completed_at
    end,
    failed_at = case
      when outbox_jobs.completed_at is not null
        or outbox_jobs.failed_at is not null then null
      else outbox_jobs.failed_at
    end,
    last_error = case
      when outbox_jobs.completed_at is not null
        or outbox_jobs.failed_at is not null then null
      else outbox_jobs.last_error
    end,
    locked_at = case
      when outbox_jobs.completed_at is not null
        or outbox_jobs.failed_at is not null then null
      else outbox_jobs.locked_at
    end
  returning id into v_job_id;

  return v_job_id;
end;
$$;

revoke all on function public.enqueue_content_watermark(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.enqueue_content_watermark(uuid, uuid)
to service_role;
