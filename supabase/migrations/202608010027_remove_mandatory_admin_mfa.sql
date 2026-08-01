create or replace function public.consume_admin_reauthentication(
  p_token_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  consumed_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin_role_required' using errcode = '42501';
  end if;
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_admin_reauthentication_token';
  end if;

  delete from public.admin_reauthentication_sessions
  where actor_id = auth.uid()
    and token_hash = p_token_hash
    and expires_at > now()
  returning id into consumed_id;

  if consumed_id is null then
    raise exception 'admin_reauthentication_required'
      using errcode = '42501';
  end if;
end;
$$;

drop policy if exists "admin cross profile reads require aal2"
on public.profiles;
drop policy if exists "admin cross purchase reads require aal2"
on public.purchases;
drop policy if exists "admin cross grant reads require aal2"
on public.access_grants;
drop policy if exists "admin revocation reads require aal2"
on public.access_revocations;
drop policy if exists "admin offer reads require aal2"
on public.external_offers;
drop policy if exists "admin event reads require aal2"
on public.incoming_events;
drop policy if exists "admin outbox reads require aal2"
on public.outbox_jobs;
drop policy if exists "admin audit reads require aal2"
on public.audit_log;
drop policy if exists "admin content reads require aal2"
on public.content_items;
drop policy if exists "admin content file reads require aal2"
on public.content_files;
drop policy if exists "admin prompt reads require aal2"
on public.ai_prompt_versions;

drop policy if exists "owner reads email delivery events at aal2"
on public.email_delivery_events;
drop policy if exists "owner reads email suppressions at aal2"
on public.email_suppressions;

create policy "owner reads email delivery events"
on public.email_delivery_events
for select
to authenticated
using ((select public.is_admin()));

create policy "owner reads email suppressions"
on public.email_suppressions
for select
to authenticated
using ((select public.is_admin()));

comment on function public.consume_admin_reauthentication(text) is
  'Consumes a short-lived, single-use password reauthentication token for the allowlisted owner admin.';
