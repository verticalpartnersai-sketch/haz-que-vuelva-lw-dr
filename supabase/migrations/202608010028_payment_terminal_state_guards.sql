create or replace function public.apply_payment_projection(
  p_event_key text,
  p_member_id uuid,
  p_product_code text,
  p_sale_code text,
  p_status text,
  p_effect text,
  p_customer_email text,
  p_external_product_code text,
  p_external_plan_code text,
  p_amount_minor bigint,
  p_currency char(3),
  p_occurred_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  purchase_row public.purchases;
  v_purchase_item_id uuid;
  v_member_id uuid;
  grant_row public.access_grants;
begin
  select *
  into purchase_row
  from public.purchases
  where provider = 'perfect_pay' and external_sale_code = p_sale_code
  for update;

  if purchase_row.id is not null and purchase_row.occurred_at > p_occurred_at then
    update public.incoming_events
    set processed_at = now(), processing_error = null
    where provider = 'perfect_pay' and event_key = p_event_key;
    return;
  end if;

  -- Refunds, chargebacks and cancellations are terminal for the original sale.
  -- Perfect Pay may deliver approved/completed events out of order while keeping
  -- the original approval timestamp. A late grant must never reopen access or AI
  -- credits after a terminal revocation.
  if purchase_row.id is not null
    and purchase_row.status in ('cancelled', 'refunded', 'charged_back')
    and p_effect = 'grant' then
    update public.incoming_events
    set processed_at = now(), processing_error = null
    where provider = 'perfect_pay' and event_key = p_event_key;
    return;
  end if;

  v_member_id := coalesce(purchase_row.member_id, p_member_id);

  insert into public.purchases (
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
    'perfect_pay',
    p_sale_code,
    v_member_id,
    lower(p_customer_email),
    p_status,
    p_amount_minor,
    p_currency,
    p_occurred_at
  )
  on conflict (provider, external_sale_code) do update
  set
    member_id = coalesce(purchases.member_id, excluded.member_id),
    customer_email = excluded.customer_email,
    status = excluded.status,
    amount_minor = excluded.amount_minor,
    currency = excluded.currency,
    occurred_at = excluded.occurred_at,
    updated_at = now()
  returning * into purchase_row;

  insert into public.purchase_items (
    purchase_id,
    product_code,
    external_product_code,
    external_plan_code
  )
  values (
    purchase_row.id,
    p_product_code,
    p_external_product_code,
    p_external_plan_code
  )
  on conflict (
    purchase_id,
    product_code,
    external_product_code,
    external_plan_code
  ) do update set product_code = excluded.product_code
  returning id into v_purchase_item_id;

  if p_effect = 'grant' and v_member_id is not null then
    insert into public.access_grants (
      member_id,
      product_code,
      source,
      source_reference,
      granted_at
    )
    values (
      v_member_id,
      p_product_code,
      'purchase',
      p_sale_code,
      p_occurred_at
    )
    on conflict do nothing;

    if p_product_code = 'vuelve_ia' then
      insert into public.ai_credit_lots (
        member_id,
        purchase_item_id,
        credits_total
      )
      values (v_member_id, v_purchase_item_id, 30)
      on conflict (purchase_item_id) do update
      set member_id = excluded.member_id, revoked_at = null;
    end if;
  elsif p_effect = 'revoke' and v_member_id is not null then
    for grant_row in
      select *
      from public.access_grants
      where member_id = v_member_id
        and product_code = p_product_code
        and source = 'purchase'
        and source_reference = p_sale_code
    loop
      insert into public.access_revocations (
        grant_id,
        reason,
        source_reference,
        revoked_at
      )
      values (
        grant_row.id,
        p_status::public.revocation_reason,
        p_event_key,
        p_occurred_at
      )
      on conflict do nothing;
    end loop;

    if p_product_code = 'vuelve_ia' then
      update public.ai_credit_lots
      set revoked_at = p_occurred_at
      where purchase_item_id = v_purchase_item_id;
    end if;
  end if;

  update public.incoming_events
  set processed_at = now(), processing_error = null
  where provider = 'perfect_pay' and event_key = p_event_key;
end;
$$;

revoke all on function public.apply_payment_projection(
  text, uuid, text, text, text, text, text, text, text, bigint, char, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_payment_projection(
  text, uuid, text, text, text, text, text, text, text, bigint, char, timestamptz
) to service_role;

comment on function public.apply_payment_projection(
  text, uuid, text, text, text, text, text, text, text, bigint, char, timestamptz
) is 'Projects Perfect Pay events while preventing late grant events from reopening terminally revoked sales.';
