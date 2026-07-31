insert into public.external_offers (
  provider,
  external_product_code,
  external_plan_code,
  product_code,
  checkout_url,
  active
)
values
  (
    'perfect_pay',
    'PPPBF7CC',
    'item:PPPBF7EK',
    '21_mensajes',
    null,
    true
  ),
  (
    'perfect_pay',
    'PPPBF7CC',
    'item:PPPBF7EL',
    'la_otra',
    null,
    true
  )
on conflict (provider, external_product_code, external_plan_code)
do update set
  product_code = excluded.product_code,
  checkout_url = excluded.checkout_url,
  active = excluded.active;
