create or replace function public.start_ai_conversation(
  p_member_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  case_id uuid;
  conversation_id uuid;
begin
  if not exists (
    select 1 from public.effective_entitlements
    where member_id = p_member_id and product_code = 'vuelve_ia'
  ) then
    raise exception 'ai_entitlement_required';
  end if;

  insert into public.ai_cases (member_id)
  values (p_member_id)
  on conflict (member_id) do update
  set status = 'active', reset_at = null
  returning id into case_id;

  insert into public.ai_conversations (case_id)
  values (case_id)
  returning id into conversation_id;

  return conversation_id;
end;
$$;

revoke all on function public.start_ai_conversation(uuid)
from public, anon, authenticated;
grant execute on function public.start_ai_conversation(uuid)
to service_role;
