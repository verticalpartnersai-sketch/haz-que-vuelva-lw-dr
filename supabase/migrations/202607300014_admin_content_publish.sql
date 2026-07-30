create unique index if not exists content_items_one_pdf_per_product_idx
on public.content_items (product_code)
where kind = 'pdf';

create or replace function public.publish_content_pdf(
  p_product_code text,
  p_title text,
  p_storage_bucket text,
  p_storage_path text,
  p_sha256 text,
  p_size_bytes bigint,
  p_mime_type text
)
returns table (
  content_item_id uuid,
  content_file_id uuid,
  published_version integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_id uuid;
  file_id uuid;
  next_version integer;
begin
  if not public.is_admin() then
    raise exception 'admin_role_required';
  end if;
  if not exists (
    select 1
    from public.products
    where code = p_product_code and active
  ) then
    raise exception 'active_product_required';
  end if;
  if length(trim(p_title)) < 3 or length(trim(p_title)) > 160 then
    raise exception 'invalid_content_title';
  end if;
  if p_storage_bucket <> 'product-content' then
    raise exception 'invalid_content_bucket';
  end if;
  if p_storage_path !~ (
    '^products/' || p_product_code || '/[0-9a-f-]{36}[.]pdf$'
  ) then
    raise exception 'invalid_content_storage_path';
  end if;
  if p_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_content_sha256';
  end if;
  if p_size_bytes <= 0 or p_size_bytes > 12582912 then
    raise exception 'invalid_content_size';
  end if;
  if p_mime_type <> 'application/pdf' then
    raise exception 'invalid_content_mime_type';
  end if;

  insert into public.content_items (
    product_code,
    title,
    kind,
    active,
    updated_at
  )
  values (
    p_product_code,
    trim(p_title),
    'pdf',
    true,
    now()
  )
  on conflict (product_code) where kind = 'pdf'
  do update set
    title = excluded.title,
    active = true,
    updated_at = now()
  returning id into item_id;

  select coalesce(max(version), 0) + 1
  into next_version
  from public.content_files
  where content_item_id = item_id;

  insert into public.content_files (
    content_item_id,
    storage_bucket,
    storage_path,
    version,
    sha256,
    mime_type,
    size_bytes
  )
  values (
    item_id,
    p_storage_bucket,
    p_storage_path,
    next_version,
    p_sha256,
    p_mime_type,
    p_size_bytes
  )
  returning id into file_id;

  insert into public.audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'content.pdf_published',
    'content_file',
    file_id::text,
    jsonb_build_object(
      'product_code', p_product_code,
      'content_item_id', item_id,
      'version', next_version,
      'size_bytes', p_size_bytes,
      'sha256', p_sha256
    )
  );

  return query select item_id, file_id, next_version;
end;
$$;

revoke all on function public.publish_content_pdf(
  text, text, text, text, text, bigint, text
) from public, anon;
grant execute on function public.publish_content_pdf(
  text, text, text, text, text, bigint, text
) to authenticated;
