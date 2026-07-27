create or replace function public.revoke_access_grant(
  p_grant_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  revocation_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin role required';
  end if;
  if length(trim(p_reason)) < 8 then
    raise exception 'reason must contain at least 8 characters';
  end if;

  insert into public.access_revocations (
    grant_id,
    reason,
    source_reference,
    revoked_by,
    detail
  )
  values (
    p_grant_id,
    'manual',
    extensions.gen_random_uuid()::text,
    auth.uid(),
    trim(p_reason)
  )
  returning id into revocation_id;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    reason
  )
  values (
    auth.uid(),
    'entitlement.revoked_manually',
    'access_grant',
    p_grant_id::text,
    trim(p_reason)
  );

  return revocation_id;
end;
$$;

create or replace function public.transfer_purchase(
  p_purchase_id uuid,
  p_target_member_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  purchase_row public.purchases;
begin
  if not public.is_admin() then
    raise exception 'admin role required';
  end if;
  if length(trim(p_reason)) < 8 then
    raise exception 'reason must contain at least 8 characters';
  end if;
  if not exists (
    select 1 from public.profiles where id = p_target_member_id
  ) then
    raise exception 'target member does not exist';
  end if;

  select * into strict purchase_row
  from public.purchases
  where id = p_purchase_id
  for update;

  update public.purchases
  set member_id = p_target_member_id, updated_at = now()
  where id = p_purchase_id;

  update public.access_grants
  set member_id = p_target_member_id
  where source = 'purchase'
    and source_reference = purchase_row.external_sale_code;

  update public.ai_credit_lots
  set member_id = p_target_member_id
  where purchase_item_id in (
    select id
    from public.purchase_items
    where purchase_id = p_purchase_id
  );

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    reason,
    metadata
  )
  values (
    auth.uid(),
    'purchase.transferred',
    'purchase',
    p_purchase_id::text,
    trim(p_reason),
    jsonb_build_object(
      'from_member_id', purchase_row.member_id,
      'to_member_id', p_target_member_id
    )
  );
end;
$$;

create or replace function public.promote_admin_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_id uuid;
begin
  update public.profiles
  set role = 'admin', updated_at = now()
  where lower(email) = lower(trim(p_email))
  returning id into profile_id;

  if profile_id is null then
    raise exception 'profile not found';
  end if;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    reason
  )
  values (
    null,
    'identity.admin_promoted_by_command',
    'profile',
    profile_id::text,
    'Bootstrap command executed from trusted environment'
  );
  return profile_id;
end;
$$;

revoke all on function public.revoke_access_grant(uuid, text) from public;
grant execute on function public.revoke_access_grant(uuid, text)
to authenticated;

revoke all on function public.transfer_purchase(uuid, uuid, text) from public;
grant execute on function public.transfer_purchase(uuid, uuid, text)
to authenticated;

revoke all on function public.promote_admin_by_email(text)
from public, anon, authenticated;
grant execute on function public.promote_admin_by_email(text)
to service_role;
