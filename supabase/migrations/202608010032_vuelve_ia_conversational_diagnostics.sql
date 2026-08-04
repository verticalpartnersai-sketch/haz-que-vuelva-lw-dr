alter table public.ai_documents
add column product_code text references public.products(code),
add column source_hash text;

create unique index ai_documents_global_product_hash_idx
on public.ai_documents (product_code, source_hash)
where scope = 'global' and source_hash is not null;

alter table public.ai_generations
add column kind text not null default 'chat'
check (kind in ('chat', 'diagnostic'));

create table public.ai_diagnostics (
  id uuid primary key default extensions.gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  case_id uuid not null references public.ai_cases(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  generation_id uuid unique references public.ai_generations(id) on delete set null,
  status text not null default 'reserved'
    check (status in ('reserved', 'processing', 'completed', 'failed')),
  input_format text not null check (input_format in ('txt', 'zip')),
  character_count integer check (character_count between 1 and 300000),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text
);

create index ai_diagnostics_member_completed_idx
on public.ai_diagnostics (member_id, completed_at desc);

alter table public.ai_diagnostics enable row level security;

create policy "member reads own diagnostics"
on public.ai_diagnostics for select to authenticated
using (member_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.ai_diagnostics to authenticated;

create or replace function public.get_vuelve_ia_access_status(
  p_member_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  access_started_at timestamptz;
  access_expires_at timestamptz;
begin
  if auth.role() <> 'service_role'
    and auth.uid() is distinct from p_member_id
    and not public.is_admin()
  then
    raise exception 'ai_access_not_allowed';
  end if;

  select max(grant_row.granted_at)
  into access_started_at
  from public.access_grants as grant_row
  where grant_row.member_id = p_member_id
    and grant_row.product_code = 'vuelve_ia'
    and not exists (
      select 1
      from public.access_revocations as revocation
      where revocation.grant_id = grant_row.id
    );

  access_expires_at := access_started_at + interval '90 days';

  return jsonb_build_object(
    'has_entitlement', access_started_at is not null,
    'access_active',
      access_started_at is not null and now() < access_expires_at,
    'access_started_at', access_started_at,
    'access_expires_at', access_expires_at,
    'access_days_remaining',
      case
        when access_started_at is null or now() >= access_expires_at then 0
        else ceil(extract(epoch from (access_expires_at - now())) / 86400)::integer
      end
  );
end;
$$;

create or replace function public.has_current_vuelve_ia_access(
  p_member_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.access_grants as grant_row
    where grant_row.member_id = p_member_id
      and grant_row.product_code = 'vuelve_ia'
      and grant_row.granted_at > now() - interval '90 days'
      and not exists (
        select 1
        from public.access_revocations as revocation
        where revocation.grant_id = grant_row.id
      )
  );
$$;

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
  if not public.has_current_vuelve_ia_access(p_member_id) then
    raise exception 'ai_access_expired';
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

create or replace function public.reserve_ai_generation(
  p_generation_id uuid,
  p_member_id uuid,
  p_conversation_id uuid,
  p_daily_limit integer default 10
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  completed_in_window integer;
  in_flight integer;
  existing_generation public.ai_generations;
begin
  if p_daily_limit < 1 or p_daily_limit > 20 then
    raise exception 'ai_limit_invalid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_member_id::text, 0));

  select * into existing_generation
  from public.ai_generations
  where id = p_generation_id
  for update;

  if existing_generation.id is not null
    and (
      existing_generation.member_id <> p_member_id
      or existing_generation.conversation_id <> p_conversation_id
      or existing_generation.kind <> 'chat'
    )
  then
    raise exception 'generation_identity_conflict';
  end if;

  if existing_generation.status in ('reserved', 'streaming', 'completed') then
    return;
  end if;

  if not public.has_current_vuelve_ia_access(p_member_id) then
    raise exception 'ai_access_expired';
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

  select count(*) into completed_in_window
  from public.ai_generations
  where member_id = p_member_id
    and kind = 'chat'
    and status = 'completed'
    and completed_at > now() - interval '24 hours';

  select count(*) into in_flight
  from public.ai_generations
  where member_id = p_member_id
    and kind = 'chat'
    and status in ('reserved', 'streaming')
    and reserved_at > now() - interval '15 minutes';

  if completed_in_window + in_flight >= p_daily_limit then
    raise exception 'ai_daily_limit_reached';
  end if;

  if existing_generation.id is null then
    insert into public.ai_generations (
      id, member_id, conversation_id, status, kind
    ) values (
      p_generation_id, p_member_id, p_conversation_id, 'reserved', 'chat'
    );
  else
    update public.ai_generations
    set status = 'reserved', reserved_at = now(), completed_at = null,
      provider_usage = '{}'::jsonb, kind = 'chat'
    where id = p_generation_id;
  end if;
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
    or generation_row.kind <> 'chat'
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

  if not public.has_current_vuelve_ia_access(p_member_id) then
    raise exception 'ai_access_expired';
  end if;

  insert into public.ai_messages (
    conversation_id, generation_id, role, content, source_refs
  ) values (
    p_conversation_id, p_generation_id, 'assistant', p_content, p_source_refs
  )
  on conflict (generation_id, role) do update
  set content = excluded.content, source_refs = excluded.source_refs
  returning id into message_id;

  update public.ai_generations
  set status = 'completed', completed_at = now(), provider_usage = p_provider_usage
  where id = p_generation_id;

  return jsonb_build_object(
    'answer', p_content,
    'safety_mode', coalesce((p_provider_usage ->> 'safety_mode')::boolean, false),
    'sources', p_source_refs
  );
end;
$$;

create or replace function public.get_ai_usage_status(
  p_member_id uuid,
  p_daily_limit integer default 10
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  used_count integer;
  oldest_completion timestamptz;
  last_diagnostic timestamptz;
  access_status jsonb;
begin
  if auth.role() <> 'service_role'
    and auth.uid() is distinct from p_member_id
    and not public.is_admin()
  then
    raise exception 'ai_usage_not_allowed';
  end if;

  select count(*), min(completed_at)
  into used_count, oldest_completion
  from public.ai_generations
  where member_id = p_member_id
    and kind = 'chat'
    and status = 'completed'
    and completed_at > now() - interval '24 hours';

  select max(completed_at) into last_diagnostic
  from public.ai_diagnostics
  where member_id = p_member_id and status = 'completed';

  access_status := public.get_vuelve_ia_access_status(p_member_id);

  return access_status || jsonb_build_object(
    'message_limit', p_daily_limit,
    'messages_used', used_count,
    'messages_remaining',
      case when (access_status ->> 'access_active')::boolean
        then greatest(p_daily_limit - used_count, 0) else 0 end,
    'messages_reset_at',
      case when used_count >= p_daily_limit
        then oldest_completion + interval '24 hours' else null end,
    'diagnostic_available',
      (access_status ->> 'access_active')::boolean
      and (last_diagnostic is null or last_diagnostic <= now() - interval '30 days'),
    'diagnostic_next_at',
      case when last_diagnostic > now() - interval '30 days'
        then last_diagnostic + interval '30 days' else null end
  );
end;
$$;

create or replace function public.reserve_ai_diagnostic(
  p_diagnostic_id uuid,
  p_generation_id uuid,
  p_member_id uuid,
  p_conversation_id uuid,
  p_input_format text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  case_id uuid;
begin
  if p_input_format not in ('txt', 'zip') then
    raise exception 'diagnostic_format_invalid';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_member_id::text, 1));

  if not public.has_current_vuelve_ia_access(p_member_id) then
    raise exception 'ai_access_expired';
  end if;

  select ai_cases.id into case_id
  from public.ai_conversations
  join public.ai_cases on ai_cases.id = ai_conversations.case_id
  where ai_conversations.id = p_conversation_id
    and ai_cases.member_id = p_member_id
    and ai_cases.status = 'active';
  if case_id is null then
    raise exception 'conversation_not_owned';
  end if;

  if exists (
    select 1 from public.ai_diagnostics
    where member_id = p_member_id
      and (
        (status = 'completed' and completed_at > now() - interval '30 days')
        or (status in ('reserved', 'processing')
          and created_at > now() - interval '30 minutes')
      )
  ) then
    raise exception 'diagnostic_monthly_limit_reached';
  end if;

  insert into public.ai_generations (
    id, member_id, conversation_id, status, kind
  ) values (
    p_generation_id, p_member_id, p_conversation_id, 'reserved', 'diagnostic'
  );

  insert into public.ai_diagnostics (
    id, member_id, case_id, conversation_id, generation_id, input_format
  ) values (
    p_diagnostic_id, p_member_id, case_id, p_conversation_id,
    p_generation_id, p_input_format
  );
  return case_id;
end;
$$;

create or replace function public.complete_ai_diagnostic(
  p_diagnostic_id uuid,
  p_member_id uuid,
  p_character_count integer,
  p_content text,
  p_provider_usage jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  diagnostic_row public.ai_diagnostics;
begin
  select * into diagnostic_row
  from public.ai_diagnostics
  where id = p_diagnostic_id and member_id = p_member_id
  for update;
  if diagnostic_row.id is null then
    raise exception 'diagnostic_context_invalid';
  end if;

  if not public.has_current_vuelve_ia_access(p_member_id) then
    raise exception 'ai_access_expired';
  end if;

  insert into public.ai_messages (
    conversation_id, generation_id, role, content
  ) values (
    diagnostic_row.conversation_id, diagnostic_row.generation_id,
    'assistant', p_content
  );

  update public.ai_generations
  set status = 'completed', completed_at = now(), provider_usage = p_provider_usage
  where id = diagnostic_row.generation_id;

  update public.ai_diagnostics
  set status = 'completed', character_count = p_character_count,
    completed_at = now(), error_code = null
  where id = p_diagnostic_id;
end;
$$;

create or replace function public.fail_ai_diagnostic(
  p_diagnostic_id uuid,
  p_error_code text
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.ai_diagnostics
  set status = 'failed', error_code = left(p_error_code, 80)
  where id = p_diagnostic_id and status in ('reserved', 'processing');
$$;

create or replace function public.match_ai_chunks_v2(
  p_member_id uuid,
  p_query text,
  p_embedding extensions.vector(768),
  p_scope text,
  p_allowed_products text[] default array[]::text[],
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
  select ai_chunks.document_id, ai_chunks.id, ai_chunks.content,
    ai_documents.scope,
    (
      0.7 * coalesce(
        1 - (ai_chunks.embedding OPERATOR(extensions.<=>) p_embedding),
        0
      )
      + 0.3 * ts_rank_cd(
        ai_chunks.search_vector, websearch_to_tsquery('simple', p_query)
      )
    )::double precision
  from public.ai_chunks
  join public.ai_documents on ai_documents.id = ai_chunks.document_id
  where (
      (
        p_scope = 'global'
        and ai_documents.scope = 'global'
        and ai_documents.published_at is not null
        and ai_chunks.owner_id is null
        and ai_documents.product_code = any(p_allowed_products)
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

create or replace function public.recent_ai_messages(
  p_member_id uuid,
  p_conversation_id uuid,
  p_limit integer default 12
)
returns table (role public.ai_message_role, content text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select recent.role, recent.content, recent.created_at
  from (
    select ai_messages.role, ai_messages.content, ai_messages.created_at
    from public.ai_messages
    join public.ai_conversations
      on ai_conversations.id = ai_messages.conversation_id
    join public.ai_cases on ai_cases.id = ai_conversations.case_id
    where ai_messages.conversation_id = p_conversation_id
      and ai_cases.member_id = p_member_id
    order by ai_messages.created_at desc
    limit least(greatest(p_limit, 1), 20)
  ) as recent
  order by recent.created_at;
$$;

create or replace function public.publish_ai_prompt_service(
  p_prompt text,
  p_admin_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_id uuid;
  prompt_id uuid;
  next_version integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role_required';
  end if;
  if length(trim(p_prompt)) < 1000 then
    raise exception 'prompt_too_short';
  end if;
  select profiles.id into admin_id
  from public.profiles
  where lower(profiles.email) = lower(p_admin_email)
    and profiles.role = 'admin';
  if admin_id is null then
    raise exception 'admin_not_found';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ai_prompt_versions', 0));
  select coalesce(max(version), 0) + 1 into next_version
  from public.ai_prompt_versions;
  update public.ai_prompt_versions
  set retired_at = now()
  where published_at is not null and retired_at is null;
  insert into public.ai_prompt_versions (
    version, prompt, created_by, published_at
  ) values (
    next_version, trim(p_prompt), admin_id, now()
  ) returning id into prompt_id;
  return prompt_id;
end;
$$;

revoke all on function public.get_ai_usage_status(uuid, integer)
from public, anon, authenticated;
revoke all on function public.get_vuelve_ia_access_status(uuid)
from public, anon, authenticated;
revoke all on function public.has_current_vuelve_ia_access(uuid)
from public, anon, authenticated;
revoke all on function public.start_ai_conversation(uuid)
from public, anon, authenticated;
revoke all on function public.reserve_ai_diagnostic(uuid, uuid, uuid, uuid, text)
from public, anon, authenticated;
revoke all on function public.complete_ai_diagnostic(uuid, uuid, integer, text, jsonb)
from public, anon, authenticated;
revoke all on function public.fail_ai_diagnostic(uuid, text)
from public, anon, authenticated;
revoke all on function public.match_ai_chunks_v2(
  uuid, text, extensions.vector, text, text[], integer
) from public, anon, authenticated;
revoke all on function public.recent_ai_messages(uuid, uuid, integer)
from public, anon, authenticated;
revoke all on function public.publish_ai_prompt_service(text, text)
from public, anon, authenticated;

grant execute on function public.get_ai_usage_status(uuid, integer) to service_role;
grant execute on function public.get_vuelve_ia_access_status(uuid) to service_role;
grant execute on function public.has_current_vuelve_ia_access(uuid) to service_role;
grant execute on function public.start_ai_conversation(uuid) to service_role;
grant execute on function public.reserve_ai_diagnostic(uuid, uuid, uuid, uuid, text)
to service_role;
grant execute on function public.complete_ai_diagnostic(uuid, uuid, integer, text, jsonb)
to service_role;
grant execute on function public.fail_ai_diagnostic(uuid, text) to service_role;
grant execute on function public.match_ai_chunks_v2(
  uuid, text, extensions.vector, text, text[], integer
) to service_role;
grant execute on function public.recent_ai_messages(uuid, uuid, integer)
to service_role;
grant execute on function public.publish_ai_prompt_service(text, text)
to service_role;
