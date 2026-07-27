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
values (
  '40000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ai-member@example.test',
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
values (
  '40000000-0000-0000-0000-000000000004',
  'vuelve_ia',
  'manual',
  'atomic-ai-fixture',
  'Synthetic atomicity fixture'
);

insert into public.purchases (
  id,
  provider,
  external_sale_code,
  member_id,
  customer_email,
  status,
  amount_minor,
  currency,
  occurred_at
)
values (
  '41000000-0000-0000-0000-000000000004',
  'perfect_pay',
  'atomic-ai-sale',
  '40000000-0000-0000-0000-000000000004',
  'ai-member@example.test',
  'approved',
  100,
  'BRL',
  now()
);

insert into public.purchase_items (
  id,
  purchase_id,
  product_code,
  external_product_code,
  external_plan_code
)
values (
  '42000000-0000-0000-0000-000000000004',
  '41000000-0000-0000-0000-000000000004',
  'vuelve_ia',
  'fixture-product',
  'fixture-plan'
);

insert into public.ai_credit_lots (
  member_id,
  purchase_item_id,
  credits_total
)
values (
  '40000000-0000-0000-0000-000000000004',
  '42000000-0000-0000-0000-000000000004',
  30
);

insert into public.ai_cases (
  id,
  member_id
)
values (
  '43000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000004'
);

insert into public.ai_conversations (
  id,
  case_id
)
values (
  '44000000-0000-0000-0000-000000000004',
  '43000000-0000-0000-0000-000000000004'
);

set local role service_role;

select lives_ok(
  $$
    select public.reserve_ai_generation(
      '45000000-0000-0000-0000-000000000004',
      '40000000-0000-0000-0000-000000000004',
      '44000000-0000-0000-0000-000000000004'
    )
  $$,
  'generation reserves with entitlement and credits'
);

select lives_ok(
  $$
    select public.persist_ai_member_message(
      '45000000-0000-0000-0000-000000000004',
      '40000000-0000-0000-0000-000000000004',
      '44000000-0000-0000-0000-000000000004',
      'Synthetic member message'
    )
  $$,
  'member message persists once for the generation'
);

select is(
  (
    public.complete_ai_generation(
      '45000000-0000-0000-0000-000000000004',
      '40000000-0000-0000-0000-000000000004',
      '44000000-0000-0000-0000-000000000004',
      'Original answer',
      '[]'::jsonb,
      '{"safety_mode": false}'::jsonb
    ) ->> 'answer'
  ),
  'Original answer',
  'completion returns the persisted answer'
);

select is(
  (select count(*)::integer from public.ai_credit_consumptions),
  1,
  'completion consumes exactly one credit'
);

select is(
  (
    public.complete_ai_generation(
      '45000000-0000-0000-0000-000000000004',
      '40000000-0000-0000-0000-000000000004',
      '44000000-0000-0000-0000-000000000004',
      'Mutated retry answer',
      '[]'::jsonb,
      '{"safety_mode": false}'::jsonb
    ) ->> 'answer'
  ),
  'Original answer',
  'replay returns the immutable persisted answer'
);

select is(
  (select count(*)::integer from public.ai_credit_consumptions),
  1,
  'replay does not consume a second credit'
);

select is(
  (
    select count(*)::integer
    from public.ai_messages
    where generation_id = '45000000-0000-0000-0000-000000000004'
  ),
  2,
  'generation has one member message and one assistant answer'
);

reset role;
select * from finish();
rollback;
