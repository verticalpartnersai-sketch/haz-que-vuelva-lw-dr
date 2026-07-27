create or replace function public.claim_outbox_jobs(
  p_job_type text,
  p_limit integer default 10
)
returns setof public.outbox_jobs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with candidates as (
    select id
    from public.outbox_jobs
    where job_type = p_job_type
      and completed_at is null
      and failed_at is null
      and available_at <= now()
      and (locked_at is null or locked_at < now() - interval '10 minutes')
    order by created_at
    for update skip locked
    limit least(greatest(p_limit, 1), 25)
  )
  update public.outbox_jobs as job
  set locked_at = now(), attempts = attempts + 1
  from candidates
  where job.id = candidates.id
  returning job.*;
end;
$$;

revoke all on function public.claim_outbox_jobs(text, integer)
from public, anon, authenticated;
grant execute on function public.claim_outbox_jobs(text, integer)
to service_role;
