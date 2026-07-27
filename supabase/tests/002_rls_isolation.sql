begin;

select plan(7);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'one@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'two@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.access_grants (
  member_id,
  product_code,
  source,
  source_reference,
  reason
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'haz_que_vuelva',
    'manual',
    'rls-member-one',
    'Synthetic RLS fixture'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'la_otra',
    'manual',
    'rls-member-two',
    'Synthetic RLS fixture'
  );

insert into storage.objects (id, bucket_id, name, owner)
values (
  '30000000-0000-0000-0000-000000000003',
  'product-content',
  'haz_que_vuelva/original.pdf',
  '10000000-0000-0000-0000-000000000001'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is(
  (select count(*)::integer from public.profiles),
  1,
  'member sees only own profile'
);
select is(
  (select count(*)::integer from public.access_grants),
  1,
  'member sees only own grants'
);
select is(
  (
    select count(*)::integer
    from public.effective_entitlements
    where product_code = 'la_otra'
  ),
  0,
  'member cannot infer another member entitlement'
);
select is(
  (select count(*)::integer from public.incoming_events),
  0,
  'member cannot inspect webhook inbox'
);
select is(
  (select count(*)::integer from public.outbox_jobs),
  0,
  'member cannot inspect outbox'
);
select is(
  (select count(*)::integer from public.ai_documents where scope = 'global'),
  0,
  'member cannot read raw global RAG documents'
);
select is(
  (
    select count(*)::integer
    from storage.objects
    where bucket_id = 'product-content'
  ),
  0,
  'member cannot read original product objects directly'
);

reset role;
select * from finish();
rollback;
