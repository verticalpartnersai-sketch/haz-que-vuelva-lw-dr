begin;

select plan(23);

select ok(
  not exists (
    select 1
    from pg_class as relation
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind in ('r', 'p')
      and not relation.relrowsecurity
  ),
  'every public application table has RLS enabled'
);

select ok(
  not has_schema_privilege('anon', 'public', 'usage'),
  'anonymous API clients cannot use the public application schema'
);

select is(
  (
    select count(*)::integer
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'anon'
  ),
  0,
  'anonymous API clients have no application table privileges'
);

select ok(
  not exists (
    select 1
    from pg_proc as function_row
    join pg_namespace as namespace on namespace.oid = function_row.pronamespace
    where namespace.nspname = 'public'
      and has_function_privilege('anon', function_row.oid, 'execute')
  ),
  'anonymous API clients cannot execute public application functions'
);

select ok(
  not exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'authenticated'
      and (
        privilege_type in ('DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
        or (
          privilege_type = 'INSERT'
          and table_name not in ('consent_records', 'privacy_requests')
        )
        or privilege_type = 'UPDATE'
      )
  ),
  'authenticated table writes are limited to explicitly approved operations'
);

select ok(
  has_column_privilege(
    'authenticated',
    'public.profiles',
    'display_name',
    'update'
  )
  and not has_column_privilege(
    'authenticated',
    'public.profiles',
    'role',
    'update'
  ),
  'members may update only their display name column'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'profiles has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.purchases'::regclass),
  'purchases has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.access_grants'::regclass),
  'access grants have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.content_files'::regclass),
  'content files have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.ai_cases'::regclass),
  'AI cases have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.ai_messages'::regclass),
  'AI messages have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.ai_documents'::regclass),
  'AI documents have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.ai_chunks'::regclass),
  'AI chunks have RLS enabled'
);
select is(
  (
    select count(*)::integer
    from public.products
    where code in (
      'haz_que_vuelva',
      '21_mensajes',
      'la_otra',
      'reconquista_30',
      'vuelve_ia'
    )
  ),
  5,
  'five canonical products are seeded'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.apply_payment_projection(text,uuid,text,text,text,text,text,text,text,bigint,character,timestamptz)',
    'execute'
  ),
  'authenticated users cannot execute payment projection'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.apply_payment_projection(text,uuid,text,text,text,text,text,text,text,bigint,character,timestamptz)',
    'execute'
  ),
  'service role can execute payment projection'
);
select ok(
  not exists (
    select 1 from storage.buckets
    where id in ('product-content', 'ai-knowledge', 'member-sensitive')
      and public
  ),
  'all application buckets are private'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.complete_ai_generation(uuid,uuid,uuid,text,jsonb,jsonb)',
    'execute'
  ),
  'authenticated users cannot complete AI generations directly'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.complete_ai_generation(uuid,uuid,uuid,text,jsonb,jsonb)',
    'execute'
  ),
  'service role can complete AI generations'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.current_ai_prompt()',
    'execute'
  ),
  'members cannot read the raw system prompt'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.get_ai_usage_health(timestamptz)',
    'execute'
  ),
  'members cannot read aggregate AI provider usage'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.get_ai_usage_health(timestamptz)',
    'execute'
  ),
  'service role can read aggregate AI provider usage'
);

select * from finish();
rollback;
