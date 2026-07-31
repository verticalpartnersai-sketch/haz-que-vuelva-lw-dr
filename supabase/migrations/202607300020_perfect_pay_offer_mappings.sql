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
    '*',
    'haz_que_vuelva',
    'https://go.centerpag.com/PPU38CQER3J',
    true
  ),
  (
    'perfect_pay',
    'PPPBF7E4',
    '*',
    'reconquista_30',
    'https://go.centerpag.com/PPU38CQERET',
    true
  ),
  (
    'perfect_pay',
    'PPPBF7E7',
    '*',
    'vuelve_ia',
    'https://go.centerpag.com/PPU38CQERFF',
    true
  )
on conflict (provider, external_product_code, external_plan_code)
do update set
  product_code = excluded.product_code,
  checkout_url = excluded.checkout_url,
  active = excluded.active;

comment on table public.external_offers is
  'Perfect Pay offer mappings. Top-level products may use plan wildcard; order bumps require exact item:<item_code> mappings.';
