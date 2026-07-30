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
    raise exception 'admin_role_required';
  end if;
  if (select auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'admin_mfa_required' using errcode = '42501';
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

create policy "admin cross profile reads require aal2"
on public.profiles
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or id = (select auth.uid())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin cross purchase reads require aal2"
on public.purchases
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or member_id = (select auth.uid())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin cross grant reads require aal2"
on public.access_grants
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or member_id = (select auth.uid())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin revocation reads require aal2"
on public.access_revocations
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin offer reads require aal2"
on public.external_offers
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin event reads require aal2"
on public.incoming_events
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin outbox reads require aal2"
on public.outbox_jobs
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin audit reads require aal2"
on public.audit_log
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin content reads require aal2"
on public.content_items
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin content file reads require aal2"
on public.content_files
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create policy "admin prompt reads require aal2"
on public.ai_prompt_versions
as restrictive
for select
to authenticated
using (
  not (select public.is_admin())
  or (select auth.jwt() ->> 'aal') = 'aal2'
);

create or replace function public.update_product_with_reauthentication(
  p_product_code text,
  p_name text,
  p_description text,
  p_active boolean,
  p_sort_order integer,
  p_reauth_token_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);

  if length(trim(p_name)) < 3 or p_sort_order < 0 then
    raise exception 'invalid_product_configuration';
  end if;

  update public.products
  set
    name = trim(p_name),
    description = nullif(trim(p_description), ''),
    active = p_active,
    sort_order = p_sort_order,
    updated_at = now()
  where code = p_product_code;

  if not found then
    raise exception 'product_not_found';
  end if;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'catalog.product_updated',
    'product',
    p_product_code,
    jsonb_build_object('active', p_active, 'sort_order', p_sort_order)
  );
end;
$$;

create or replace function public.upsert_external_offer_with_reauthentication(
  p_external_product_code text,
  p_external_plan_code text,
  p_product_code text,
  p_checkout_url text,
  p_active boolean,
  p_reauth_token_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  offer_id uuid;
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);

  if length(trim(p_external_product_code)) < 1
    or length(trim(p_external_plan_code)) < 1
    or (
      nullif(trim(p_checkout_url), '') is not null
      and trim(p_checkout_url) !~ '^https://'
    )
  then
    raise exception 'invalid_offer_configuration';
  end if;

  insert into public.external_offers (
    provider,
    external_product_code,
    external_plan_code,
    product_code,
    checkout_url,
    active
  )
  values (
    'perfect_pay',
    trim(p_external_product_code),
    trim(p_external_plan_code),
    p_product_code,
    nullif(trim(p_checkout_url), ''),
    p_active
  )
  on conflict (provider, external_product_code, external_plan_code)
  do update set
    product_code = excluded.product_code,
    checkout_url = excluded.checkout_url,
    active = excluded.active
  returning id into offer_id;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'catalog.external_offer_upserted',
    'external_offer',
    offer_id::text,
    jsonb_build_object(
      'provider', 'perfect_pay',
      'product_code', p_product_code,
      'active', p_active
    )
  );

  return offer_id;
end;
$$;

create or replace function public.queue_member_invitation_with_reauthentication(
  p_member_id uuid,
  p_display_name text,
  p_request_id uuid,
  p_reauth_token_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_email text;
  job_id uuid;
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);

  select email into member_email
  from public.profiles
  where id = p_member_id;

  if member_email is null then
    raise exception 'member_not_found';
  end if;

  update public.profiles
  set
    display_name = coalesce(nullif(trim(p_display_name), ''), display_name),
    updated_at = now()
  where id = p_member_id;

  insert into public.outbox_jobs (
    job_type,
    aggregate_type,
    aggregate_id,
    idempotency_key,
    payload
  )
  values (
    'send_member_invitation',
    'profile',
    p_member_id::text,
    'admin-member-invite/' || p_request_id::text,
    jsonb_build_object('member_id', p_member_id, 'email', member_email)
  )
  on conflict (idempotency_key)
  do update set idempotency_key = excluded.idempotency_key
  returning id into job_id;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'identity.member_invitation_queued',
    'profile',
    p_member_id::text,
    jsonb_build_object('request_id', p_request_id)
  );

  return job_id;
end;
$$;

revoke all on function public.update_product_with_reauthentication(
  text, text, text, boolean, integer, text
) from public, anon;
grant execute on function public.update_product_with_reauthentication(
  text, text, text, boolean, integer, text
) to authenticated;

revoke all on function public.upsert_external_offer_with_reauthentication(
  text, text, text, text, boolean, text
) from public, anon;
grant execute on function public.upsert_external_offer_with_reauthentication(
  text, text, text, text, boolean, text
) to authenticated;

revoke all on function public.queue_member_invitation_with_reauthentication(
  uuid, text, uuid, text
) from public, anon;
grant execute on function public.queue_member_invitation_with_reauthentication(
  uuid, text, uuid, text
) to authenticated;
