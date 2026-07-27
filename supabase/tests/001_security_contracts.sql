begin;

select plan(15);

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

select * from finish();
rollback;
