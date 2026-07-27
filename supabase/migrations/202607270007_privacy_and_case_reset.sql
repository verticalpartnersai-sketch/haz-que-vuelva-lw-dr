create table public.consent_records (
  id uuid primary key default extensions.gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null check (
    consent_type in (
      'adult_18',
      'terms',
      'privacy',
      'third_party_data',
      'marketing'
    )
  ),
  document_version text not null,
  accepted boolean not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (member_id, consent_type, document_version)
);

create table public.ai_case_inputs (
  id uuid primary key default extensions.gen_random_uuid(),
  case_id uuid not null references public.ai_cases(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  input_index integer not null check (input_index between 0 and 5),
  content text not null,
  character_count integer generated always as (length(content)) stored,
  created_at timestamptz not null default now(),
  unique (case_id, input_index),
  constraint input_character_limit check (
    (input_index = 0 and length(content) between 1 and 30000)
    or (input_index between 1 and 5 and length(content) between 1 and 10000)
  )
);

create table public.privacy_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  member_id uuid not null references public.profiles(id),
  request_type text not null check (request_type in ('export', 'delete')),
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'failed')
  ),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text
);

alter table public.consent_records enable row level security;
alter table public.ai_case_inputs enable row level security;
alter table public.privacy_requests enable row level security;

create policy "member reads own consent"
on public.consent_records for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member records own consent"
on public.consent_records for insert to authenticated
with check (member_id = (select auth.uid()));

create policy "member owns case inputs"
on public.ai_case_inputs for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member reads own privacy requests"
on public.privacy_requests for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

create policy "member creates own privacy requests"
on public.privacy_requests for insert to authenticated
with check (member_id = (select auth.uid()));

grant select, insert on public.consent_records to authenticated;
grant select on public.ai_case_inputs to authenticated;
grant select, insert on public.privacy_requests to authenticated;

create or replace function public.reset_ai_case(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role'
    and auth.uid() is distinct from p_member_id
    and not public.is_admin()
  then
    raise exception 'case_reset_not_allowed';
  end if;

  delete from public.ai_documents
  where scope = 'member' and owner_id = p_member_id;

  delete from public.ai_cases
  where member_id = p_member_id;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id
  )
  values (
    auth.uid(),
    'ai.case_reset',
    'profile',
    p_member_id::text
  );
end;
$$;

revoke all on function public.reset_ai_case(uuid) from public;
grant execute on function public.reset_ai_case(uuid)
to authenticated, service_role;
