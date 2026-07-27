alter table public.profiles
add column invited_at timestamptz;

grant update (display_name) on public.profiles to authenticated;

create index outbox_jobs_claim_idx
on public.outbox_jobs (job_type, available_at, created_at)
where completed_at is null and failed_at is null;
