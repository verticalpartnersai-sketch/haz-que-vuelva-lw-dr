alter table public.ai_messages
add column generation_id uuid
references public.ai_generations(id) on delete set null;

alter table public.ai_messages
add constraint ai_messages_generation_role_unique
unique (generation_id, role);

create or replace function public.persist_ai_member_message(
  p_generation_id uuid,
  p_member_id uuid,
  p_conversation_id uuid,
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  message_id uuid;
begin
  if not exists (
    select 1 from public.ai_generations
    where id = p_generation_id
      and member_id = p_member_id
      and conversation_id = p_conversation_id
      and status in ('reserved', 'streaming')
  ) then
    raise exception 'generation_context_invalid';
  end if;

  insert into public.ai_messages (
    conversation_id,
    generation_id,
    role,
    content
  )
  values (p_conversation_id, p_generation_id, 'member', p_content)
  on conflict (generation_id, role) do update
  set generation_id = excluded.generation_id
  returning id into message_id;

  return message_id;
end;
$$;

create or replace function public.complete_ai_generation(
  p_generation_id uuid,
  p_member_id uuid,
  p_conversation_id uuid,
  p_content text,
  p_source_refs jsonb default '[]'::jsonb,
  p_provider_usage jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  generation_row public.ai_generations;
  lot_id uuid;
  message_id uuid;
  persisted_answer text;
  persisted_sources jsonb;
begin
  select * into generation_row
  from public.ai_generations
  where id = p_generation_id
  for update;

  if generation_row.id is null
    or generation_row.member_id <> p_member_id
    or generation_row.conversation_id <> p_conversation_id
  then
    raise exception 'generation_context_invalid';
  end if;

  if generation_row.status = 'completed' then
    select id, content, source_refs
    into message_id, persisted_answer, persisted_sources
    from public.ai_messages
    where generation_id = p_generation_id and role = 'assistant';

    if message_id is null then
      raise exception 'completed_generation_without_answer';
    end if;

    return jsonb_build_object(
      'answer', persisted_answer,
      'safety_mode',
      coalesce((generation_row.provider_usage ->> 'safety_mode')::boolean, false),
      'sources', persisted_sources
    );
  end if;

  if generation_row.status not in ('reserved', 'streaming') then
    raise exception 'generation_not_reservable';
  end if;

  select credit_lot.id into lot_id
  from public.ai_credit_lots as credit_lot
  where credit_lot.member_id = p_member_id
    and credit_lot.revoked_at is null
    and (
      select count(*)
      from public.ai_credit_consumptions
      where credit_lot_id = credit_lot.id
    ) < credit_lot.credits_total
  order by credit_lot.created_at
  for update skip locked
  limit 1;

  if lot_id is null then
    raise exception 'ai_credits_exhausted';
  end if;

  insert into public.ai_messages (
    conversation_id,
    generation_id,
    role,
    content,
    source_refs
  )
  values (
    p_conversation_id,
    p_generation_id,
    'assistant',
    p_content,
    p_source_refs
  )
  on conflict (generation_id, role) do update
  set generation_id = excluded.generation_id
  returning id into message_id;

  insert into public.ai_credit_consumptions (generation_id, credit_lot_id)
  values (p_generation_id, lot_id);

  update public.ai_generations
  set
    status = 'completed',
    completed_at = now(),
    provider_usage = p_provider_usage
  where id = p_generation_id;

  return jsonb_build_object(
    'answer', p_content,
    'safety_mode',
    coalesce((p_provider_usage ->> 'safety_mode')::boolean, false),
    'sources', p_source_refs
  );
end;
$$;

revoke all on function public.complete_ai_generation(
  uuid, uuid, uuid, text, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_ai_generation(
  uuid, uuid, uuid, text, jsonb, jsonb
) to service_role;

revoke all on function public.persist_ai_member_message(
  uuid, uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.persist_ai_member_message(
  uuid, uuid, uuid, text
) to service_role;
