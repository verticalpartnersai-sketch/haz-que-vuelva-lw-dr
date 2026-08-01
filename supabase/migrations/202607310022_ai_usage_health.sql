create or replace function public.get_ai_usage_health(
  p_since timestamptz
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with recent as (
    select
      provider_usage,
      case
        when jsonb_typeof(provider_usage -> 'total_tokens') = 'number'
          and (provider_usage ->> 'total_tokens')::numeric
            between 0 and 9007199254740991
        then (provider_usage ->> 'total_tokens')::bigint
        else null
      end as total_tokens,
      case
        when jsonb_typeof(provider_usage -> 'prompt_tokens') = 'number'
          and jsonb_typeof(provider_usage -> 'output_tokens') = 'number'
          and jsonb_typeof(provider_usage -> 'model') = 'string'
        then (provider_usage ->> 'prompt_tokens')::numeric >= 0
          and (provider_usage ->> 'output_tokens')::numeric >= 0
          and length(trim(provider_usage ->> 'model')) > 0
        else false
      end as usage_valid
    from public.ai_generations
    where status = 'completed'
      and completed_at is not null
      and completed_at >= p_since
  )
  select jsonb_build_object(
    'completed_generations', count(*),
    'total_tokens', coalesce(sum(total_tokens), 0),
    'missing_usage', count(*) filter (
      where total_tokens is null
        or not usage_valid
    )
  )
  from recent;
$$;

revoke all on function public.get_ai_usage_health(timestamptz)
from public, anon, authenticated;
grant execute on function public.get_ai_usage_health(timestamptz)
to service_role;
