drop policy if exists "admin manages products" on public.products;
drop policy if exists "admin manages offers" on public.external_offers;
drop policy if exists "admin manages prompts" on public.ai_prompt_versions;

revoke insert, update, delete on public.products from authenticated;
revoke insert, update, delete on public.external_offers from authenticated;
revoke insert, update, delete on public.ai_prompt_versions from authenticated;

create policy "admin reads offers"
on public.external_offers for select to authenticated
using ((select public.is_admin()));

create policy "admin reads prompts"
on public.ai_prompt_versions for select to authenticated
using ((select public.is_admin()));

revoke all on function public.grant_manual_access(uuid, text, text)
from public, anon, authenticated;
revoke all on function public.revoke_access_grant(uuid, text)
from public, anon, authenticated;
revoke all on function public.transfer_purchase(uuid, uuid, text)
from public, anon, authenticated;
revoke all on function public.create_ai_prompt_draft(text)
from public, anon, authenticated;
revoke all on function public.publish_ai_prompt(uuid)
from public, anon, authenticated;

create or replace function public.grant_manual_access_with_reauthentication(
  p_member_id uuid,
  p_product_code text,
  p_reason text,
  p_reauth_token_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);
  return public.grant_manual_access(
    p_member_id,
    p_product_code,
    p_reason
  );
end;
$$;

create or replace function public.revoke_access_grant_with_reauthentication(
  p_grant_id uuid,
  p_reason text,
  p_reauth_token_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);
  return public.revoke_access_grant(p_grant_id, p_reason);
end;
$$;

create or replace function public.transfer_purchase_with_reauthentication(
  p_purchase_id uuid,
  p_target_member_id uuid,
  p_reason text,
  p_reauth_token_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);
  perform public.transfer_purchase(
    p_purchase_id,
    p_target_member_id,
    p_reason
  );
end;
$$;

create or replace function public.create_ai_prompt_draft_with_reauthentication(
  p_prompt text,
  p_reauth_token_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);
  return public.create_ai_prompt_draft(p_prompt);
end;
$$;

create or replace function public.publish_ai_prompt_with_reauthentication(
  p_prompt_id uuid,
  p_reauth_token_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.consume_admin_reauthentication(p_reauth_token_hash);
  perform public.publish_ai_prompt(p_prompt_id);
end;
$$;

revoke all on function public.grant_manual_access_with_reauthentication(
  uuid, text, text, text
) from public, anon;
grant execute on function public.grant_manual_access_with_reauthentication(
  uuid, text, text, text
) to authenticated;

revoke all on function public.revoke_access_grant_with_reauthentication(
  uuid, text, text
) from public, anon;
grant execute on function public.revoke_access_grant_with_reauthentication(
  uuid, text, text
) to authenticated;

revoke all on function public.transfer_purchase_with_reauthentication(
  uuid, uuid, text, text
) from public, anon;
grant execute on function public.transfer_purchase_with_reauthentication(
  uuid, uuid, text, text
) to authenticated;

revoke all on function public.create_ai_prompt_draft_with_reauthentication(
  text, text
) from public, anon;
grant execute on function public.create_ai_prompt_draft_with_reauthentication(
  text, text
) to authenticated;

revoke all on function public.publish_ai_prompt_with_reauthentication(
  uuid, text
) from public, anon;
grant execute on function public.publish_ai_prompt_with_reauthentication(
  uuid, text
) to authenticated;
