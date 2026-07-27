create unique index ai_prompt_one_published_idx
on public.ai_prompt_versions ((true))
where published_at is not null and retired_at is null;

create or replace function public.create_ai_prompt_draft(p_prompt text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  prompt_id uuid;
  next_version integer;
begin
  if not public.is_admin() then
    raise exception 'admin role required';
  end if;
  if length(trim(p_prompt)) < 80 then
    raise exception 'prompt_too_short';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ai_prompt_versions', 0));
  select coalesce(max(version), 0) + 1
  into next_version
  from public.ai_prompt_versions;

  insert into public.ai_prompt_versions (
    version,
    prompt,
    created_by
  )
  values (next_version, trim(p_prompt), auth.uid())
  returning id into prompt_id;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id
  )
  values (
    auth.uid(),
    'ai.prompt_draft_created',
    'ai_prompt_version',
    prompt_id::text
  );

  return prompt_id;
end;
$$;

create or replace function public.publish_ai_prompt(p_prompt_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin role required';
  end if;
  if not exists (
    select 1 from public.ai_prompt_versions where id = p_prompt_id
  ) then
    raise exception 'prompt_not_found';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ai_prompt_versions', 0));

  update public.ai_prompt_versions
  set retired_at = now()
  where published_at is not null and retired_at is null;

  update public.ai_prompt_versions
  set published_at = coalesce(published_at, now()), retired_at = null
  where id = p_prompt_id;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id
  )
  values (
    auth.uid(),
    'ai.prompt_published',
    'ai_prompt_version',
    p_prompt_id::text
  );
end;
$$;

create or replace function public.current_ai_prompt()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  prompt_text text;
begin
  select prompt into prompt_text
  from public.ai_prompt_versions
  where published_at is not null and retired_at is null;

  if prompt_text is null then
    raise exception 'published_prompt_required';
  end if;

  return prompt_text;
end;
$$;

revoke all on function public.create_ai_prompt_draft(text) from public;
grant execute on function public.create_ai_prompt_draft(text) to authenticated;

revoke all on function public.publish_ai_prompt(uuid) from public;
grant execute on function public.publish_ai_prompt(uuid) to authenticated;

revoke all on function public.current_ai_prompt()
from public, anon, authenticated;
grant execute on function public.current_ai_prompt() to service_role;
