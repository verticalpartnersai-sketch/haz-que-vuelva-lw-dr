begin;

select plan(20);

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
  '70000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'payment-lifecycle@example.test',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

select public.apply_payment_projection(
  'pp-lifecycle-main-approved',
  '70000000-0000-0000-0000-000000000007',
  'haz_que_vuelva',
  'PP-LIFECYCLE-SALE-007',
  'approved',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'PLAN-HQV-TEST',
  700,
  'USD',
  '2026-08-01 12:00:00+00'
);

select public.apply_payment_projection(
  'pp-lifecycle-bump-approved',
  '70000000-0000-0000-0000-000000000007',
  '21_mensajes',
  'PP-LIFECYCLE-SALE-007',
  'approved',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'item:PPPBF7EK',
  700,
  'USD',
  '2026-08-01 12:00:00+00'
);

select is(
  (
    select count(*)::integer
    from public.purchases
    where external_sale_code = 'PP-LIFECYCLE-SALE-007'
  ),
  1,
  'main product and order bump share one purchase'
);

select is(
  (
    select status
    from public.purchases
    where external_sale_code = 'PP-LIFECYCLE-SALE-007'
  ),
  'approved',
  'approved sale is projected with its provider status'
);

select is(
  (
    select count(*)::integer
    from public.purchase_items as item
    join public.purchases as purchase on purchase.id = item.purchase_id
    where purchase.external_sale_code = 'PP-LIFECYCLE-SALE-007'
  ),
  2,
  'main product and order bump remain isolated purchase items'
);

select is(
  (
    select count(*)::integer
    from public.access_grants
    where member_id = '70000000-0000-0000-0000-000000000007'
      and source = 'purchase'
      and source_reference = 'PP-LIFECYCLE-SALE-007'
  ),
  2,
  'approved sale grants exactly the two purchased products'
);

select is(
  (
    select count(*)::integer
    from public.effective_entitlements
    where member_id = '70000000-0000-0000-0000-000000000007'
  ),
  2,
  'both purchased products become effective entitlements'
);

select public.apply_payment_projection(
  'pp-lifecycle-main-approved-replay',
  '70000000-0000-0000-0000-000000000007',
  'haz_que_vuelva',
  'PP-LIFECYCLE-SALE-007',
  'approved',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'PLAN-HQV-TEST',
  700,
  'USD',
  '2026-08-01 12:00:00+00'
);

select public.apply_payment_projection(
  'pp-lifecycle-bump-approved-replay',
  '70000000-0000-0000-0000-000000000007',
  '21_mensajes',
  'PP-LIFECYCLE-SALE-007',
  'approved',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'item:PPPBF7EK',
  700,
  'USD',
  '2026-08-01 12:00:00+00'
);

select is(
  (
    select count(*)::integer
    from public.purchase_items as item
    join public.purchases as purchase on purchase.id = item.purchase_id
    where purchase.external_sale_code = 'PP-LIFECYCLE-SALE-007'
  ),
  2,
  'approved replay does not duplicate purchase items'
);

select is(
  (
    select count(*)::integer
    from public.access_grants
    where member_id = '70000000-0000-0000-0000-000000000007'
      and source_reference = 'PP-LIFECYCLE-SALE-007'
  ),
  2,
  'approved replay does not duplicate grants'
);

select public.apply_payment_projection(
  'pp-lifecycle-main-refunded',
  '70000000-0000-0000-0000-000000000007',
  'haz_que_vuelva',
  'PP-LIFECYCLE-SALE-007',
  'refunded',
  'revoke',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'PLAN-HQV-TEST',
  700,
  'USD',
  '2026-08-02 12:00:00+00'
);

select is(
  (
    select count(*)::integer
    from public.effective_entitlements
    where member_id = '70000000-0000-0000-0000-000000000007'
      and product_code = 'haz_que_vuelva'
  ),
  0,
  'refund revokes the matching main product'
);

select is(
  (
    select count(*)::integer
    from public.effective_entitlements
    where member_id = '70000000-0000-0000-0000-000000000007'
      and product_code = '21_mensajes'
  ),
  1,
  'refunding the main line does not revoke its order bump'
);

select is(
  (
    select count(*)::integer
    from public.access_revocations as revocation
    join public.access_grants as grant_row on grant_row.id = revocation.grant_id
    where grant_row.member_id = '70000000-0000-0000-0000-000000000007'
  ),
  1,
  'main-line refund creates one product-scoped revocation'
);

select public.apply_payment_projection(
  'pp-lifecycle-bump-refunded',
  '70000000-0000-0000-0000-000000000007',
  '21_mensajes',
  'PP-LIFECYCLE-SALE-007',
  'refunded',
  'revoke',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'item:PPPBF7EK',
  700,
  'USD',
  '2026-08-02 12:00:00+00'
);

select is(
  (
    select count(*)::integer
    from public.effective_entitlements
    where member_id = '70000000-0000-0000-0000-000000000007'
  ),
  0,
  'refunding every purchased line removes every effective entitlement'
);

select is(
  (
    select count(*)::integer
    from public.access_revocations as revocation
    join public.access_grants as grant_row on grant_row.id = revocation.grant_id
    where grant_row.member_id = '70000000-0000-0000-0000-000000000007'
  ),
  2,
  'each purchased line receives exactly one revocation'
);

select is(
  (
    select status
    from public.purchases
    where external_sale_code = 'PP-LIFECYCLE-SALE-007'
  ),
  'refunded',
  'purchase remains in its terminal refund state'
);

select public.apply_payment_projection(
  'pp-lifecycle-main-late-completed',
  '70000000-0000-0000-0000-000000000007',
  'haz_que_vuelva',
  'PP-LIFECYCLE-SALE-007',
  'completed',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'PLAN-HQV-TEST',
  700,
  'USD',
  '2026-08-03 12:00:00+00'
);

select public.apply_payment_projection(
  'pp-lifecycle-bump-late-completed',
  '70000000-0000-0000-0000-000000000007',
  '21_mensajes',
  'PP-LIFECYCLE-SALE-007',
  'completed',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7CC',
  'item:PPPBF7EK',
  700,
  'USD',
  '2026-08-03 12:00:00+00'
);

select is(
  (
    select status
    from public.purchases
    where external_sale_code = 'PP-LIFECYCLE-SALE-007'
  ),
  'refunded',
  'late completed event cannot reopen a terminal purchase'
);

select is(
  (
    select count(*)::integer
    from public.access_grants
    where member_id = '70000000-0000-0000-0000-000000000007'
      and source_reference = 'PP-LIFECYCLE-SALE-007'
  ),
  2,
  'late completed event cannot create replacement grants'
);

select is(
  (
    select count(*)::integer
    from public.effective_entitlements
    where member_id = '70000000-0000-0000-0000-000000000007'
  ),
  0,
  'late completed event cannot restore effective access'
);

select is(
  (
    select count(*)::integer
    from public.access_revocations as revocation
    join public.access_grants as grant_row on grant_row.id = revocation.grant_id
    where grant_row.member_id = '70000000-0000-0000-0000-000000000007'
  ),
  2,
  'late completed event does not mutate terminal revocations'
);

select public.apply_payment_projection(
  'pp-lifecycle-ai-approved',
  '70000000-0000-0000-0000-000000000007',
  'vuelve_ia',
  'PP-LIFECYCLE-AI-007',
  'approved',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7E7',
  'PLAN-VUELVE-IA-TEST',
  1900,
  'USD',
  '2026-08-01 13:00:00+00'
);

select is(
  (
    select count(*)::integer
    from public.ai_credit_lots
    where member_id = '70000000-0000-0000-0000-000000000007'
      and credits_total = 30
      and revoked_at is null
  ),
  1,
  'VUELVE IA purchase grants one active credit lot'
);

select public.apply_payment_projection(
  'pp-lifecycle-ai-charged-back',
  '70000000-0000-0000-0000-000000000007',
  'vuelve_ia',
  'PP-LIFECYCLE-AI-007',
  'charged_back',
  'revoke',
  'payment-lifecycle@example.test',
  'PPPBF7E7',
  'PLAN-VUELVE-IA-TEST',
  1900,
  'USD',
  '2026-08-02 13:00:00+00'
);

select is(
  (
    select count(*)::integer
    from public.ai_credit_lots
    where member_id = '70000000-0000-0000-0000-000000000007'
      and revoked_at is not null
  ),
  1,
  'VUELVE IA chargeback revokes its credit lot'
);

select public.apply_payment_projection(
  'pp-lifecycle-ai-late-completed',
  '70000000-0000-0000-0000-000000000007',
  'vuelve_ia',
  'PP-LIFECYCLE-AI-007',
  'completed',
  'grant',
  'payment-lifecycle@example.test',
  'PPPBF7E7',
  'PLAN-VUELVE-IA-TEST',
  1900,
  'USD',
  '2026-08-03 13:00:00+00'
);

select is(
  (
    select count(*)::integer
    from public.ai_credit_lots
    where member_id = '70000000-0000-0000-0000-000000000007'
      and revoked_at is null
  ),
  0,
  'late VUELVE IA completion cannot restore revoked credits'
);

select * from finish();
rollback;
