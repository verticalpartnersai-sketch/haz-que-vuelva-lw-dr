-- BGE-M3 is multilingual and emits 1024-dimensional dense vectors. The
-- existing production knowledge base was published without embeddings, so the
-- type can be upgraded without discarding indexed data. Fail closed in any
-- environment that already contains vectors instead of silently corrupting it.
do $$
begin
  if exists (
    select 1 from public.ai_chunks where embedding is not null
  ) then
    raise exception 'ai_chunks_embedding_backfill_must_be_cleared_first';
  end if;
end;
$$;

alter table public.ai_chunks
alter column embedding type extensions.vector(1024)
using null::extensions.vector(1024);

create or replace function public.match_ai_chunks_v2(
  p_member_id uuid,
  p_query text,
  p_embedding extensions.vector(1024),
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

revoke all on function public.match_ai_chunks_v2(
  uuid, text, extensions.vector, text, text[], integer
) from public, anon, authenticated;

grant execute on function public.match_ai_chunks_v2(
  uuid, text, extensions.vector, text, text[], integer
) to service_role;
