create or replace function public.reserve_ai_generation(
  p_generation_id uuid,
  p_member_id uuid,
  p_conversation_id uuid,
  p_daily_limit integer default 5
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  credits_total integer;
  credits_consumed integer;
  credits_reserved integer;
  completed_today integer;
  existing_generation public.ai_generations;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_member_id::text, 0));

  select * into existing_generation
  from public.ai_generations
  where id = p_generation_id
  for update;

  if existing_generation.id is not null
    and (
      existing_generation.member_id <> p_member_id
      or existing_generation.conversation_id <> p_conversation_id
    )
  then
    raise exception 'generation_identity_conflict';
  end if;

  if existing_generation.status in ('reserved', 'streaming', 'completed') then
    return;
  end if;

  if not exists (
    select 1 from public.effective_entitlements
    where member_id = p_member_id and product_code = 'vuelve_ia'
  ) then
    raise exception 'ai_entitlement_required';
  end if;

  if not exists (
    select 1
    from public.ai_conversations
    join public.ai_cases on ai_cases.id = ai_conversations.case_id
    where ai_conversations.id = p_conversation_id
      and ai_cases.member_id = p_member_id
      and ai_cases.status = 'active'
  ) then
    raise exception 'conversation_not_owned';
  end if;

  select coalesce(sum(credit_lot.credits_total), 0)
  into credits_total
  from public.ai_credit_lots as credit_lot
  where credit_lot.member_id = p_member_id
    and credit_lot.revoked_at is null;

  select count(*) into credits_consumed
  from public.ai_credit_consumptions
  join public.ai_generations
    on ai_generations.id = ai_credit_consumptions.generation_id
  join public.ai_credit_lots
    on ai_credit_lots.id = ai_credit_consumptions.credit_lot_id
  where ai_generations.member_id = p_member_id
    and ai_credit_lots.revoked_at is null;

  select count(*) into credits_reserved
  from public.ai_generations
  where member_id = p_member_id and status in ('reserved', 'streaming');

  if credits_total - credits_consumed - credits_reserved <= 0 then
    raise exception 'ai_credits_exhausted';
  end if;

  select count(*) into completed_today
  from public.ai_generations
  where member_id = p_member_id
    and status = 'completed'
    and completed_at >= date_trunc('day', now());

  if completed_today >= p_daily_limit then
    raise exception 'ai_daily_limit_reached';
  end if;

  if existing_generation.id is null then
    insert into public.ai_generations (
      id,
      member_id,
      conversation_id,
      status
    )
    values (
      p_generation_id,
      p_member_id,
      p_conversation_id,
      'reserved'
    );
  else
    update public.ai_generations
    set
      status = 'reserved',
      reserved_at = now(),
      completed_at = null,
      provider_usage = '{}'::jsonb
    where id = p_generation_id;
  end if;
end;
$$;

create or replace function public.consume_ai_generation(
  p_generation_id uuid,
  p_provider_usage jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  generation_row public.ai_generations;
  lot_id uuid;
begin
  select * into generation_row
  from public.ai_generations
  where id = p_generation_id
  for update;

  if generation_row.status = 'completed' then
    return;
  end if;
  if generation_row.status not in ('reserved', 'streaming') then
    raise exception 'generation_not_reservable';
  end if;

  select credit_lot.id into lot_id
  from public.ai_credit_lots as credit_lot
  where credit_lot.member_id = generation_row.member_id
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

  insert into public.ai_credit_consumptions (generation_id, credit_lot_id)
  values (p_generation_id, lot_id);

  update public.ai_generations
  set
    status = 'completed',
    completed_at = now(),
    provider_usage = p_provider_usage
  where id = p_generation_id;
end;
$$;

create or replace function public.release_ai_generation(
  p_generation_id uuid,
  p_status public.ai_generation_status default 'failed'
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.ai_generations
  set status = p_status
  where id = p_generation_id and status in ('reserved', 'streaming');
$$;

create or replace function public.match_ai_chunks(
  p_member_id uuid,
  p_query text,
  p_embedding extensions.vector(768),
  p_scope text,
  p_limit integer default 8
)
returns table (
  document_id uuid,
  chunk_id uuid,
  content text,
  scope text,
  score double precision
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    ai_chunks.document_id,
    ai_chunks.id,
    ai_chunks.content,
    ai_documents.scope,
    (
      0.7 * (
        1 - (
          ai_chunks.embedding OPERATOR(extensions.<=>) p_embedding
        )
      )
      + 0.3 * ts_rank_cd(
        ai_chunks.search_vector,
        websearch_to_tsquery('simple', p_query)
      )
    )::double precision
  from public.ai_chunks
  join public.ai_documents on ai_documents.id = ai_chunks.document_id
  where ai_chunks.embedding is not null
    and (
      (
        p_scope = 'global'
        and ai_documents.scope = 'global'
        and ai_documents.published_at is not null
        and ai_chunks.owner_id is null
      )
      or (
        p_scope = 'member'
        and ai_documents.scope = 'member'
        and ai_chunks.owner_id = p_member_id
      )
    )
  order by 5 desc
  limit least(greatest(p_limit, 1), 20);
$$;

revoke all on function public.reserve_ai_generation(uuid, uuid, uuid, integer)
from public, anon, authenticated;
revoke all on function public.consume_ai_generation(uuid, jsonb)
from public, anon, authenticated;
revoke all on function public.release_ai_generation(
  uuid, public.ai_generation_status
) from public, anon, authenticated;
revoke all on function public.match_ai_chunks(
  uuid, text, extensions.vector, text, integer
) from public, anon, authenticated;

grant execute on function public.reserve_ai_generation(uuid, uuid, uuid, integer)
to service_role;
grant execute on function public.consume_ai_generation(uuid, jsonb)
to service_role;
grant execute on function public.release_ai_generation(
  uuid, public.ai_generation_status
) to service_role;
grant execute on function public.match_ai_chunks(
  uuid, text, extensions.vector, text, integer
) to service_role;
